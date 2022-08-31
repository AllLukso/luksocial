import { FC } from "react";
import { useCurrentProfile } from "@strandgeek/react-powerup";
import { ipfsUriToGatewayUrl } from "../utils/ipfs";

export const ProfileCard: FC<{ onEditClick: () => void }> = ({ onEditClick }) => {
  const profile = useCurrentProfile();
  if (!profile) {
    return null
  }
  const { handle } = profile;
  const backgroundImage = profile.backgroundImage.at(-1) as any;
  const profileImage = profile.profileImage.at(-1) as any;
  return (
    <div>
      <div className="card w-lg max-w-lg bg-base-100 shadow-xl group">
        <div className="w-full h-[160px]">
          <img
            className="object-cover w-full h-full"
            src={ipfsUriToGatewayUrl(backgroundImage?.url || "")}
            alt="Profile Cover"
          />
          <figure></figure>
        </div>
        <div className="card-body relative">
          <div className="absolute left-0 top-[-48px] flex items-center justify-center w-full">
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={ipfsUriToGatewayUrl(profileImage?.url || "")}
                  alt="Profile Avatar"
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="mt-8 text-center font-bold text-lg">
              @{handle.name}
              <span className="opacity-40">#{handle.tag}</span>
            </h2>
            <p className="mt-4">{profile.description}</p>
            <div className="mt-8">
              {profile.tags.map((tag: any) => (
                <span className="mr-2 text-gray-400">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full text-center mt-4">
        <button className="btn btn-link" onClick={onEditClick}>
          Edit Profile
        </button>
      </div>
    </div>
  );
};
