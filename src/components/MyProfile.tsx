import { useWallet } from "@strandgeek/react-powerup";
import { FC, useEffect, useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { ProfileForm } from "./ProfileForm";
import { Feed } from "../lib/feed";
import { ipfsUriToGatewayUrl } from "../utils/ipfs";

export interface MyProfileProps {}

export const MyProfile: FC<MyProfileProps> = () => {
  const [publishing, setPublishing] = useState(false)
  const [page, setPage] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [feed, setFeed] = useState<Feed>();
  const [canLoadMore, setCanLoadMore] = useState(true)
  const [feedItems, setFeedItems] = useState<string[]>([]);
  const { profile, provider } = useWallet();
  console.log(provider);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      const feed = new Feed({
        profile,
        provider,
        pageSize: 5,
      });
      setFeed(feed);
      // Get Initial Feed
      feed.getItems({ page: 0 }).then((items) => {
        setFeedItems([...items.reverse()]);
      });
    }
  }, [profile, provider]);

  const loadMore = () => {
    if (!feed) {
      return
    }
    const nextPage = page + 1
    setPage(nextPage)
    feed.getItems({ page: nextPage }).then((items) => {
      if (items.length === 0) {
        setCanLoadMore(false)
      } else {
        setFeedItems([...feedItems, ...items.reverse()]);
      }
    });
  }

  const onPublishClick = async () => {
    setPublishing(true)
    try {      
      await feed?.pushItem(text)
      setFeedItems(feedItems => [text, ...feedItems])
      setText('')
    } catch (error) {
      console.error(error)
    }
    setPublishing(false)
  }

  if (!profile) {
    return null
  }

  const profileImage = profile?.profileImage?.at(-1) as any || {};
  return (
    <div>
      {isEditing ? (
        <ProfileForm backToProfileCard={() => setIsEditing(false)} />
      ) : (
        <div className="w-[480px]">
          <div className="flex justify-center w-full mb-8">
            <img src="/luksocial-logo.png" className="h-8 " />
          </div>
          <ProfileCard onEditClick={() => setIsEditing(true)} />

          <div className="form-control">
            <label className="label">
              <span className="label-text">What's on your mind?</span>
            </label>
            <textarea
              disabled={publishing}
              onChange={(e) => setText(e.target.value)}
              value={text}
              className="textarea textarea-bordered h-24"
              placeholder="Write something"
            ></textarea>
            <button
              disabled={publishing}
              className={`btn btn-primary ${publishing ? 'loading' : ''}`}
              onClick={() => onPublishClick()}
            >
              {publishing ? 'Publishing' : 'Publish'}
            </button>
          </div>

          <div className="my-10">
            {feedItems.map((item) => (
              <div className="card card-compact w-full bg-base-100 shadow-xl mb-2">
                <div className="card-body">
                  <div className="flex items-center">
                    <div>
                      <div className="avatar mr-4">
                        <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={ipfsUriToGatewayUrl(profileImage.url)}
                            alt="Profile Avatar"
                          />
                        </div>
                      </div>
                    </div>
                    <div>{item}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {canLoadMore && (
            <button className="btn btn-link btn-block" onClick={() => loadMore()}>
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
};
