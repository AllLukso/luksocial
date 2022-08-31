import { FC, useEffect, useState } from "react";
import { useCurrentProfile } from "@strandgeek/react-powerup";
import { UpdateProfileData } from "@strandgeek/powerup";
import { ipfsUriToGatewayUrl } from "../utils/ipfs";

export interface ProfileFormProps {
  backToProfileCard: () => void;
}

export const ProfileForm: FC<ProfileFormProps> = ({ backToProfileCard }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>()
  const [formData, setFormData] = useState<UpdateProfileData | null>(null);
  const profile = useCurrentProfile();
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        description: profile.description,
      });
    }
  }, [profile]);
  const onSaveClick = async () => {
    setLoading(true)
    try {
      if (!profile || !formData?.name || !formData.description) {
        return;
      }
      await profile.update(formData);
      await profile.load()
      backToProfileCard()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  };
  if (!formData) {
    return null;
  }
  const onTextFieldChange = (field: string) => (e: any) =>
    setFormData((pd: any) => ({ ...pd, [field]: e.target.value }));
  const profileImage = profile?.profileImage.at(-1);
  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Update Profile</h2>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            disabled={loading}
            type="text"
            className="input input-bordered w-full"
            value={formData.name}
            onChange={onTextFieldChange("name")}
          />
        </div>
        <div className="form-control w-full">
          <div className="flex items-center my-4">
            <div>
              <div className="avatar">
                <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={avatarPreviewUrl || ipfsUriToGatewayUrl(profileImage?.url || '')}
                    alt="Profile Avatar"
                  />
                </div>
              </div>
            </div>
            <label className="btn btn-primary ml-4" htmlFor="image">
              Change Image
            </label>
            <input
              disabled={loading}
              className="hidden"
              aria-describedby="user_avatar_help"
              id="image"
              type="file"
              onChange={(e) => {
                const { files } = e.target;
                if (!files) {
                  return;
                }
                const file = files.length > 0 ? files[0] : null;
                if (!file) {
                  return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => setAvatarPreviewUrl(reader.result?.toString())

                setFormData({
                  ...formData,
                  profileImage: file,
                });
              }}
            />
          </div>

          <label className="label">
            <span className="label-text">Bio</span>
          </label>
          <textarea
            disabled={loading}
            className="textarea textarea-bordered"
            value={formData.description}
            onChange={onTextFieldChange("description")}
          ></textarea>
        </div>
        <div className="card-actions justify-end mt-4">
          <button className={`btn btn-ghost ${loading ? 'hidden' : ''}`} onClick={backToProfileCard} disabled={loading}>
            Cancel
          </button>
          <button className={`btn btn-primary ${loading ? 'loading opacity-70' : ''}`} onClick={onSaveClick}>
            {loading ? 'Saving' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
