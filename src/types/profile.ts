export interface ProfileRequest {
  user: string;
}

export interface ProfileResponse {
  location: string;
  bio: string;
  skillLevel: string;
  dateJoined: Date;
  userImg: string;
}

export interface UpdateProfileRequest {
  user: string;
  session: string;
  location?: string;
  bio?: string;
  skillLevel?: string;
  userImg?: string;
}

