<template>
  <div class="group-page">

    <h1>Groups</h1>
    <p>Manage and Explore Groups</p>

    <!-- Tabs for different views -->
    <div class="tabs">
      <button :class="{ active: currentTab === 'myGroups' }" @click="currentTab = 'myGroups'; fetchMyGroups();">My Groups</button>
      <button :class="{ active: currentTab === 'ledGroups' }" @click="currentTab = 'ledGroups'; fetchLedGroups();">Groups I Lead</button>
      <button :class="{ active: currentTab === 'publicGroups' }" @click="currentTab = 'publicGroups'; fetchPublicGroups();">Join Groups</button>
    </div>

    <div v-if="currentTab === 'myGroups'" class="my-groups-section">
      <h2>Groups I Am A Member Of</h2>
      <ul>
        <li v-for="group in myGroups" :key="group.group">
          <strong>{{ group.name }}</strong>
          <button @click="leaveGroup(group)">Leave Group</button>
          <button v-if="group.leader === userId" @click="deleteGroup(group)">Delete Group</button>
          <ul>
            <li v-for="member in group.members" :key="member">{{ member }}</li>
          </ul>
        </li>
      </ul>
    </div>

    <div v-if="currentTab === 'ledGroups'">
      <h2>Create a New Group</h2>
      <div class="create-group-form">
        <input
          v-model="newGroupName"
          placeholder="Group Name"
          class="input"
        />

        <label class="checkbox">
          <input type="checkbox" v-model="newGroupPrivate" />
          Private Group
        </label>

        <button @click="createGroup">Create Group</button>
      </div>
    </div>

    <div v-if="currentTab === 'ledGroups'" class="led-groups-section">
      <ul>
        <li v-for="group in ledGroups" :key="group.group">
          <strong>{{ group.name }}</strong>
          <div>
            <button @click="showModal[group.group] = true">Show Info</button>

            <!-- Modal -->
            <div 
              v-if="showModal[group.group]" 
              class="modal-overlay" 
              @click.self="showModal[group.group] = false"
            >
              <div class="modal-content">

                <h2>{{ group.name }} - Info</h2>

                <!-- REQUESTS SECTION -->
                <button 
                  class="section-toggle"
                  @click="expandedRequests[group.group] = !expandedRequests[group.group]"
                >
                  {{ expandedRequests[group.group] ? 'Hide Requests' : 'Show Requests' }}
                </button>

                <div v-if="expandedRequests[group.group]" class="modal-section">
                  <h4>Membership Requests</h4>
                  <ul>
                    <li v-for="request in group.requests" :key="request.membershipRequest">
                      {{ request.requester }}
                      <button @click="acceptRequest(group, request)">Accept</button>
                      <button @click="denyRequest(group, request)">Deny</button>
                    </li>
                  </ul>
                </div>


                <!-- MEMBERS SECTION -->
                <button 
                  class="section-toggle"
                  @click="expandedMembers[group.group] = !expandedMembers[group.group]"
                >
                  {{ expandedMembers[group.group] ? 'Hide Members' : 'Show Members' }}
                </button>

                <div v-if="expandedMembers[group.group]" class="modal-section">
                  <h4>Members</h4>
                  <ul>
                    <li v-for="member in group.members" :key="member">{{ member }}</li>
                  </ul>
                </div>

                <!-- CLOSE BUTTON -->
                <button class="close-btn" @click="showModal[group.group] = false">
                  Close
                </button>

              </div>
            </div>
          </div>

          <button @click="deleteGroup(group)">Delete Group</button>

        </li>
      </ul>
    </div>

    <div v-if="currentTab === 'publicGroups'" class="public-groups-section">
      <h2>Join Groups</h2>

      <input 
        v-model="searchQuery" 
        @input="searchGroups" 
        placeholder="Search all groups..."
        class="input"
      />

        <!-- 
        If searchQuery is empty: show all joinable groups
        If searchQuery has text: show searchResults only
        -->

      <ul>
        <li 
          v-for="group in (searchQuery ? searchResults : publicGroups)" 
          :key="group.group"
        >
          <strong>{{ group.name }}</strong>

          <button 
            v-if="!isMember(group) && !hasRequested(group.group)"
            @click="joinGroup(group)"
          >
            Request Join
          </button>

          <span v-else-if="hasRequested(group.group)">Request Sent</span>
          <span v-else>Already a member</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { groupApi } from "@/services/api/groupApi.ts";
import { useAuthStore } from "@/stores/auth.ts";
import type {
  GetGroupsResponse,
  GetGroupRequestsResponse,
  GetMembersResponse,
  GetNameResponse,
  GetLeaderResponse,
  GetPublicGroupsResponse,
  RequestGroupResponse,
  AcceptGroupRequest,
  DenyGroupRequest,
  RemoveMemberRequest,
  DeleteGroupRequest,
  RequestGroupRequest,
  IsPrivateResponse,
  CreateRequest, 
  CreateResponse, 
} from "@/types/group";

import type { GetUsernameResponse } from "@/types/api";

const authStore = useAuthStore();
const userId = computed(() => authStore.user?._id);
const session = computed(() => authStore.sessionId);

type GroupItem = {
  group: string;
  name: string;
  leader: string;
  members: string[];
  requests: { membershipRequest: string; requester: string }[];
};

const currentTab = ref<"myGroups" | "ledGroups" | "publicGroups">("myGroups");

// MODAL STATE
const expandedRequests = ref<Record<string, boolean>>({});
const expandedMembers = ref<Record<string, boolean>>({});
const showModal = ref<Record<string, boolean>>({});

// GROUP STATE
const myGroups = ref<GroupItem[]>([]);
const allGroups = ref<GroupItem[]>([]);
const ledGroups = ref<GroupItem[]>([]);
const publicGroups = ref<GroupItem[]>([]);
const newGroupName = ref<string>("");
const newGroupPrivate = ref<boolean>(false);

// SEARCH STATE
const searchQuery = ref("");
const searchResults = ref<GroupItem[]>([]);
const sentRequests = ref<Set<string>>(new Set()); // store requested group IDs

// MAPPER FROM IDS TO USERNAMES
const idToUsernames = ref<Record<string, string>>({});

// HELPER FUNCTIONS

const idsToUsernames = async (ids: string[]): Promise<string[]> => {
  return Promise.all(
    ids.map(async (id) => {
      if (id in idToUsernames.value && idToUsernames.value[id]) {
        return idToUsernames.value[id];
      }
      const res: GetUsernameResponse | { status: string, error: unknown; } = (await authStore._getUsername(id));
      console.log('username res', res);
      if (Array.isArray(res) && res[0] && res[0].username) {
        idToUsernames.value[id] = res[0].username;
        return res[0].username;
      }
      return "Unknown";
    })
  );
};


// GROUP QUERIES

const fetchMyGroups = async () => {
  if (!userId.value) return;
  const res: GetGroupsResponse = (await groupApi.getGroups({ user: userId.value })).data;
  console.log('res', res);
  myGroups.value = await Promise.all(
    res.map(async (g: {group: string, leader: string, name: string}) => {
      const membersRes: GetMembersResponse = (await groupApi.getMembers({ group: g.group })).data;
      const nameMembersRes: string[] = await idsToUsernames(membersRes);
      console.log('nameMembersRes',nameMembersRes);
      const requestsRes: GetGroupRequestsResponse = (await groupApi.getGroupRequests({ group: g.group })).data;
      console.log('requestsRes', requestsRes);
      return {
        group: g.group,
        name: g.name,
        leader: g.leader,
        members: nameMembersRes,
        requests: requestsRes,
      };
    })
  );
  console.log('my groups: ', myGroups.value);
};

const fetchLedGroups = async () => {
if (!userId.value) return;
fetchMyGroups();
console.log('fetching groups', myGroups.value);
  ledGroups.value = [];
  for (const group of myGroups.value) {
    if (group.leader === userId.value) {
      const requestsRes: GetGroupRequestsResponse = (await groupApi.getGroupRequests({ group: group.group })).data;

      const requestsResWithUsernames: {membershipRequest: string, requester: string}[] = await Promise.all (
        requestsRes.map(async (r: {membershipRequest: string, requester: string}) => {
          const username = (await idsToUsernames([r.requester]))[0];
          if (!username) {
            return {
              membershipRequest: r.membershipRequest,
              requester: "Unknown"
            };
          }
          return {
            membershipRequest: r.membershipRequest,
            requester: username,
          };
        }));
      
      updateModalState(group.group);

      ledGroups.value.push({
      group: group.group, 
      name: group.name,
      leader: group.leader,
      members: group.members,
      requests: requestsResWithUsernames 
      });

    }
  }
  console.log('ledGroups', ledGroups.value);
};

const fetchPublicGroups = async (): Promise<void> => {
if (!userId.value) return;
  const res = allGroups.value;
  // FILTERING OUT GROUPS WE ARE ALREADY IN 
  const newGroups = res.filter((g: {group: string; name: string; leader: string}) => {
    return !myGroups.value.some((mg) => mg.group === g.group);
  });
  
  console.log('public groups res', res);
  publicGroups.value = 
    await Promise.all(
    newGroups.map(async (g: {group: string; name: string; leader: string}) => {
      const members = (await groupApi.getMembers({ group: g.group })).data;
      console.log('members', members);
      const nameMembersRes: string[] = await idsToUsernames(members);
      return {
      group: g.group,
      name: g.name,
      leader: g.leader,
      members: nameMembersRes,
      requests: [],
      }
    })
  );
};

const fetchAllGroups = async (): Promise<void> => {
  if (!userId.value) return;
  const res = (await groupApi.getPublicGroups()).data;
  allGroups.value = res.map((g: {group: string; name: string; leader: string}) => ({
    group: g.group,
    name: g.name,
    leader: g.leader,
    members: [],
    requests: [],
  }));
}

const fetchRequestedGroups = async(): Promise<void> => {
  if (!userId.value) return;
  const res = (await groupApi.getUserRequests({user: userId.value})).data;
  sentRequests.value = new Set(res.map((r: {group: string, membershipRequest: string}) => r.group));
}

const hasRequested = (groupId: string) => {
  return sentRequests.value.has(groupId);
}

// MODIFY MODAL STATE
const updateModalState = (groupId: string) => {
  if (!(groupId in showModal.value)) {
    showModal.value[groupId] = false;
  }
  if (!(groupId in expandedRequests.value)) {
    expandedRequests.value[groupId] = false;
  }
  if (!(groupId in expandedMembers.value)) {
    expandedMembers.value[groupId] = false;
  }
};


// CHECK IS MEMBER
const isMember = (group: GroupItem) => myGroups.value.some((g) => g.group === group.group);


// SEARCH Groups
const searchGroups = async () => {
  fetchAllGroups();
  if (!searchQuery.value.trim()) {
    searchResults.value = allGroups.value;
    return;
  }

  const q = searchQuery.value.toLowerCase();

  const publicMatches = allGroups.value.filter((g) => 
    g.name.toLowerCase().includes(q)
  );

  const newPublicMatches = publicMatches.filter((g) => 
    !myGroups.value.some((mg) => mg.group === g.group)
  );

  searchResults.value = newPublicMatches;
}

// REQUEST TO JOIN GROUP

const joinGroup = async (group: GroupItem) => {
if (!userId.value) return;
if (!session.value) return;
  const isPrivateRes: IsPrivateResponse = (await groupApi.isPrivate({ group: group.group })).data;
  const request: RequestGroupRequest = { session: session.value, user: userId.value, group: group.group };
  const requestId: RequestGroupResponse = (await groupApi.request(request)).data;
  if (!isPrivateRes[0]) {
    return;
  }
  if (!isPrivateRes[0].isPrivate) {
    const request: AcceptGroupRequest = { session: session.value, membershipRequest: requestId.membershipRequest };
    await groupApi.accept(request);
    alert("Joined public group automatically");
  } else {
    alert("Request sent to join private group");
  }
  await fetchMyGroups();
  await fetchLedGroups();
  await fetchRequestedGroups();
};

// LEAVE GROUP

const leaveGroup = async (group: GroupItem) => {
if (!session.value) return;
if (!userId.value) return;
  if (group.leader === userId.value) {
    const req: DeleteGroupRequest = { session: session.value, group: group.group };
    await groupApi.deleteGroup(req);
  } else {
    const req: RemoveMemberRequest = { session: session.value, user: userId.value, group: group.group };
    await groupApi.removeMember(req);
  }
  await fetchMyGroups();
  await fetchLedGroups();
};

// CREATE GROUP

const createGroup = async () => {
if (!userId.value) return;
if (!session.value) return;
  if (!newGroupName.value.trim()) {
    alert("Please enter a group name.");
    return;
  }

  const request: CreateRequest = {
    session: session.value,
    leader: userId.value,
    name: newGroupName.value.trim(),
    privateGroup: newGroupPrivate.value,
  };

  const res = await groupApi.create(request);
  const data: CreateResponse = res.data;

  // Reset form fields
  newGroupName.value = "";
  newGroupPrivate.value = false;

  // Refresh data
  await fetchMyGroups();
  await fetchLedGroups();
  await fetchAllGroups();

  alert(`Group created with ID: ${data.group}`);
};

// DELETE GROUP

const deleteGroup = async (group: GroupItem) => {
  if (!session.value) return;
  const req: DeleteGroupRequest = { session: session.value, group: group.group };
  await groupApi.deleteGroup(req);
  await fetchMyGroups();
  await fetchLedGroups();
  await fetchAllGroups();
};

// ACCEPT REQUEST

const acceptRequest = async (group: GroupItem, request: { membershipRequest: string; requester: string }) => {
  if (!session.value) return;
  const req: AcceptGroupRequest = { session: session.value, membershipRequest: request.membershipRequest };
  await groupApi.accept(req);
  await fetchLedGroups();
  await fetchMyGroups();
};

// DENY REQUEST

const denyRequest = async (group: GroupItem, request: { membershipRequest: string; requester: string }) => {
  if (!session.value) return;
  const req: DenyGroupRequest = { session: session.value, membershipRequest: request.membershipRequest };
  await groupApi.deny(req);
  await fetchLedGroups();
};

onMounted(async () => {
  await fetchMyGroups();
  await fetchLedGroups();
  await fetchMyGroups();
  await fetchRequestedGroups();
  await fetchPublicGroups();
  await fetchAllGroups();
});

</script>

<style scoped>
/* =============== PAGE LAYOUT =============== */
.group-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px;
  font-family: "Inter", sans-serif;
  color: #e5e5e5;
}

.group-page h1 {
  font-size: 2.1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.group-page p {
  color: #b5b5b5;
  margin-bottom: 1.6rem;
}

.group-page h2 {
  font-size: 1.3rem;
  margin: 1.4rem 0 0.6rem;
  color: #ececec;
}

/* =============== TABS =============== */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 22px;
}

.tabs button {
  padding: 9px 16px;
  background: #2b2b2b;
  border: 1px solid #444;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #e5e5e5;
  cursor: pointer;
  transition: 0.15s ease;
}

.tabs button:hover {
  background: #3a3a3a;
}

.tabs button.active {
  background: #4b4b4b;
  border-color: #5a5a5a;
  color: white;
  font-weight: 600;
}

/* =============== GENERAL LIST STYLE =============== */
ul {
  list-style: none;
  padding: 0;
}

li {
  background: #1c1c1c;
  border: 1px solid #333;
  padding: 18px;
  border-radius: 10px;
  margin-top: 20px;
  margin-bottom: 14px;
  color: #f0f0f0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

/* Nested lists */
li ul li {
  background: #262626;
  border: 1px solid #3c3c3c;
  padding: 12px;
  margin-top: 6px;
  border-radius: 8px;
}

/* =============== INPUTS =============== */
.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  background: #2b2b2b;
  border: 1px solid #444;
  color: #f0f0f0;
  margin-bottom: 14px;
}

.input::placeholder {
  color: #969696;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 16px;
}

/* =============== BUTTONS =============== */
button {
  padding: 10px 18px;
  border-radius: 8px;
  background: #4a4a4a;
  color: #f2f2f2;
  border: 1px solid #5a5a5a;
  cursor: pointer;
  font-size: 0.95rem;
  transition: 0.15s ease;

  margin-left: 10px;
  margin-top: 6px; /* FIX: spacing between buttons */
}

button:hover {
  background: #5a5a5a;
}

button:disabled {
  background: #6a6a6a;
  color: #b5b5b5;
}

/* Secondary section toggle buttons */
.section-toggle {
  background: #3a3a3a !important;
}

.section-toggle:hover {
  background: #2f2f2f !important;
}

/* Close button (modal) */
.close-btn {
  background: #5a3c3c !important;
  border-color: #704848;
  margin-top: 12px;
}

.close-btn:hover {
  background: #7a4c4c !important;
}

/* =============== MODAL =============== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
}

.modal-content {
  background: #1c1c1c;
  padding: 26px;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  border: 1px solid #3a3a3a;
  box-shadow: 0 0 16px rgba(0,0,0,0.4);
}

/* Restore original block layout for CREATE GROUP */
.modal-section {
  background: #232323;
  border: 1px solid #3c3c3c;
  padding: 18px;
  border-radius: 10px;
  margin-bottom: 16px;
}

/* Inputs restored to original layout look */
.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  background: #2b2b2b;
  border: 1px solid #444;
  color: #f0f0f0;
  margin-bottom: 12px;   /* tighter spacing */
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 16px;    /* clean spacing */
}

/* Buttons under the form (same alignment as original UI) */
button {
  padding: 10px 18px;
  border-radius: 8px;
  background: #4a4a4a;
  color: #f2f2f2;
  border: 1px solid #5a5a5a;
  cursor: pointer;
  font-size: 0.95rem;
  transition: 0.15s ease;
  margin-top: 6px;
}

button.create-btn {
  width: 100%;         /* full width like original */
  margin-top: 10px;
}

/* Red close button */
.close-btn {
  background: #5a3c3c !important;
  border-color: #704848;
  margin-top: 14px;
}

.close-btn:hover {
  background: #7a4c4c !important;
}


</style>
