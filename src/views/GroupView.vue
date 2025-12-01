<template>
  <div class="group-page">

    <h1>Groups</h1>

    <!-- Tabs for different views -->
    <div class="tabs">
      <button :class="{ active: currentTab === 'myGroups' }" @click="currentTab = 'myGroups'">My Groups</button>
      <button :class="{ active: currentTab === 'ledGroups' }" @click="currentTab = 'ledGroups'">Groups I Lead</button>
      <button :class="{ active: currentTab === 'publicGroups' }" @click="currentTab = 'publicGroups'">Public Groups</button>
    </div>

    <div v-if="currentTab === 'myGroups'">
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

  <h2>Groups I Lead</h2>

    <div v-if="currentTab === 'ledGroups'">
      <h2>Groups I Lead</h2>
      <ul>
        <li v-for="group in ledGroups" :key="group.group">
          <strong>{{ group.name }}</strong>
          <button @click="deleteGroup(group)">Delete Group</button>

          <h4>Membership Requests</h4>
          <ul>
            <li v-for="request in group.requests" :key="request.membershipRequest">
              {{ request.requester }}
              <button @click="acceptRequest(group, request)">Accept</button>
              <button @click="denyRequest(group, request)">Deny</button>
            </li>
          </ul>

          <h4>Members</h4>
          <ul>
            <li v-for="member in group.members" :key="member">{{ member }}</li>
          </ul>
        </li>
      </ul>
    </div>

    <div v-if="currentTab === 'publicGroups'">
      <h2>Public Groups</h2>
      <ul>
        <li v-for="group in publicGroups" :key="group.group">
          <strong>{{ group.name }}</strong>
          <button v-if="!isMember(group)" @click="joinGroup(group)">Join Group</button>
          <span v-else>Already a member</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { groupApi } from "@/services/api/groupApi.ts";
import { useAuthStore } from "@/stores/auth.ts";
import type {
  GetGroupsResponse,
  GetGroupRequestsResponse,
  GetMembersResponse,
  GetNameResponse,
  GetLeaderResponse,
  GetPublicGroupsResponse,
  AcceptGroupRequest,
  DenyGroupRequest,
  RemoveMemberRequest,
  DeleteGroupRequest,
  RequestGroupRequest,
  IsPrivateResponse,
  CreateRequest, 
  CreateResponse, 
} from "@/types/group";

const authStore = useAuthStore();
const userId = authStore.userId!;

type GroupItem = {
  group: string;
  name: string;
  leader: string;
  members: string[];
  requests: { membershipRequest: string; requester: string }[];
};

const currentTab = ref<"myGroups" | "ledGroups" | "publicGroups">("myGroups");

const myGroups = ref<GroupItem[]>([]);
const ledGroups = ref<GroupItem[]>([]);
const publicGroups = ref<GroupItem[]>([]);
const newGroupName = ref<string>("");
const newGroupPrivate = ref<boolean>(false);

const fetchMyGroups = async () => {
  console.log('user id', userId);
  const res: GetGroupsResponse = (await groupApi.getGroups({ user: userId })).data;
  console.log('res', res);
  myGroups.value = await Promise.all(
    res.groups.map(async (g) => {
      const groupName: GetNameResponse = (await groupApi.getName({ group: g })).data;
      const groupLeader: GetLeaderResponse = (await groupApi.getLeader({ group: g })).data;
      const membersRes: GetMembersResponse = (await groupApi.getMembers({ group: g })).data;
      return {
        group: g,
        name: groupName.name,
        leader: groupLeader.leader,
        members: membersRes.members,
        requests: [],
      };
    })
  );
  console.log('my groups: ', myGroups.value);
};

const fetchLedGroups = async () => {
console.log('fetching groups');
  ledGroups.value = [];
  for (const group of myGroups.value) {
    if (group.leader === userId) {
      const requestsRes: GetGroupRequestsResponse = (await groupApi.getGroupRequests({ group: group.group })).data;
      ledGroups.value.push({
      group: group.group, 
      name: group.name,
      leader: group.leader,
      members: group.members,
      requests: requestsRes.requests 
      });
    }
  }
  console.log('ledGroups', ledGroups.value);
};

const fetchPublicGroups = async (): Promise<void> => {
  const res: GetPublicGroupsResponse = (await groupApi.getPublicGroups()).data;

  publicGroups.value = await Promise.all(
    res.groups.map(async (g: string): Promise<GroupItem> => {
      const [nameRes, leaderRes] = await Promise.all([
        groupApi.getName({ group: g }),
        groupApi.getLeader({ group: g }),
      ]);

      const groupName: GetNameResponse = nameRes.data;
      const groupLeader: GetLeaderResponse = leaderRes.data;

      return {
        group: g,
        name: groupName.name ?? g,
        leader: groupLeader.leader ?? "",
        members: [],
        requests: [],
      };
    })
  );
};

const isMember = (group: GroupItem) => myGroups.value.some((g) => g.group === group.group);

const joinGroup = async (group: GroupItem) => {
  const isPrivateRes: IsPrivateResponse = (await groupApi.isPrivate({ group: group.group })).data;
  const request: RequestGroupRequest = { user: userId, group: group.group };
  await groupApi.request(request);
  if (!isPrivateRes.isPrivate) {
    alert("Joined public group automatically");
  } else {
    alert("Request sent to join private group");
  }
  await fetchMyGroups();
};

const leaveGroup = async (group: GroupItem) => {
  if (group.leader === userId) {
    const req: DeleteGroupRequest = { group: group.group };
    await groupApi.deleteGroup(req);
  } else {
    const req: RemoveMemberRequest = { user: userId, group: group.group };
    await groupApi.removeMember(req);
  }
  await fetchMyGroups();
  await fetchLedGroups();
};

const createGroup = async () => {
  if (!newGroupName.value.trim()) {
    alert("Please enter a group name.");
    return;
  }

  const request: CreateRequest = {
    leader: userId,
    name: newGroupName.value.trim(),
    private: newGroupPrivate.value,
  };

  const res = await groupApi.create(request);
  const data: CreateResponse = res.data;

  // Reset form fields
  newGroupName.value = "";
  newGroupPrivate.value = false;

  // Refresh data
  await fetchMyGroups();
  await fetchLedGroups();

  alert(`Group created with ID: ${data.group}`);
};


const deleteGroup = async (group: GroupItem) => {
  const req: DeleteGroupRequest = { group: group.group };
  await groupApi.deleteGroup(req);
  await fetchMyGroups();
  await fetchLedGroups();
};

const acceptRequest = async (group: GroupItem, request: { membershipRequest: string; requester: string }) => {
  const req: AcceptGroupRequest = { membershipRequest: request.membershipRequest };
  await groupApi.accept(req);
  await fetchLedGroups();
  await fetchMyGroups();
};

const denyRequest = async (group: GroupItem, request: { membershipRequest: string; requester: string }) => {
  const req: DenyGroupRequest = { membershipRequest: request.membershipRequest };
  await groupApi.deny(req);
  await fetchLedGroups();
};

onMounted(async () => {
  await fetchMyGroups();
  await fetchLedGroups();
  await fetchPublicGroups();
});

</script>

<style scoped>
.group-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  padding: 10px 15px;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  background-color: #f0f0f0;
}

.tabs button.active {
  border-bottom: 2px solid #007bff;
  font-weight: bold;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 10px;
}

button {
  margin-left: 10px;
}

.create-group-form {
  margin-bottom: 20px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.input {
  padding: 8px;
  margin-right: 10px;
}

.checkbox {
  margin-right: 10px;
  color: black;
}

.create-group-form button {
  padding: 6px 12px;
}

</style>
