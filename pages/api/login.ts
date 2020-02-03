import { stringify } from "querystring";

export default function(_req, res) {
  const redirectUri = `https://www.reddit.com/api/v1/authorize?${stringify({
    client_id: process.env.REDDIT_OAUTH_ID,
    response_type: "code",
    state: process.env.OAUTH_STATE,
    redirect_uri: `${process.env.REDDIT_OAUTH_REDIRECT_ORIGIN}/api/oauth/redirect/reddit`,
    duration: "temporary",
    scope: "identity"
  })}`;
  res.writeHead(301, { Location: redirectUri });
  res.end();
}
