import React, { useState } from "react";
import Input from "@maael/temtem-input-component";
import Button from "@maael/temtem-button-component";
import useCallableFetch from "../hooks/useCallableFetch";
import { User } from "../../types/db";
import { getUserType, UserType } from "../../util/user";

interface Props {
  user: User;
}

export default function EditUserDetails({ user }: Props) {
  const [temtemName, setTemtemName] = useState(user.temtemName || "");
  const [discordFullName, setDiscordFullName] = useState(
    user.discordFullName || ""
  );
  const [redditName, setRedditName] = useState(user.redditName || "");
  const [steamId, setSteamId] = useState(user.steamId || "");
  const [updateUser, _data, savingUpdate] = useCallableFetch(
    "/db/user",
    { method: "PUT" },
    { source: "local" }
  );
  const userType = getUserType(user);
  return (
    <div
      css={{ maxWidth: 500, margin: "5px auto 15px auto", padding: "0px 10px" }}
    >
      <Input
        containerStyle={{ margin: "5px 0px" }}
        prefixStyle={{ width: 150 }}
        prefix="Temtem Username"
        placeholder="Temtem Username..."
        value={temtemName}
        onChange={({ target }) => setTemtemName((target as any).value)}
      />
      <Input
        containerStyle={{
          margin: "5px 0px",
          cursor: userType === UserType.DISCORD ? "not-allowed" : "inherit"
        }}
        prefixStyle={{ width: 150, backgroundColor: "#7289DA" }}
        style={{
          cursor: userType === UserType.REDDIT ? "not-allowed" : "inherit"
        }}
        prefix="Discord Name"
        placeholder="Discord Name..."
        value={discordFullName}
        onChange={({ target }) => setDiscordFullName((target as any).value)}
        disabled={userType === UserType.DISCORD}
      />
      <Input
        containerStyle={{
          margin: "5px 0px",
          cursor: userType === UserType.REDDIT ? "not-allowed" : "inherit"
        }}
        prefixStyle={{ width: 150, backgroundColor: "#FF5700" }}
        style={{
          cursor: userType === UserType.REDDIT ? "not-allowed" : "inherit"
        }}
        prefix="Reddit Name"
        placeholder="Reddit Name..."
        value={redditName}
        onChange={({ target }) => setRedditName((target as any).value)}
        disabled={userType === UserType.REDDIT}
      />
      <Input
        containerStyle={{ margin: "5px 0px" }}
        prefixStyle={{ width: 150, backgroundColor: "#000000" }}
        prefix="Steam ID"
        placeholder="https://steamcommunity.com/profiles/<id>..."
        value={steamId}
        onChange={({ target }) => setSteamId((target as any).value)}
      />
      <Button
        onClick={async () => {
          await updateUser({
            body: JSON.stringify({
              temtemName: temtemName || null,
              discordFullName: discordFullName || null,
              discordName: discordFullName.split("#")[0],
              discordDiscriminator: discordFullName.split("#")[1],
              redditName: redditName || null,
              steamId: steamId || null
            })
          });
        }}
        disabled={!!savingUpdate}
      >
        {savingUpdate ? "Saving" : "Save"}
      </Button>
    </div>
  );
}
