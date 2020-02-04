import fetch from "isomorphic-fetch";
import TemtemText from "@maael/temtem-text-component";
import TemtemPortrait from "@maael/temtem-portrait-component";
import { colors } from "@maael/temtem-theme";
import useFetch from "../../components/hooks/useFetch";

export default function UserPage({ user = {} }: any) {
  const [listingsResult] = useFetch(
    `/db/exchange/listings/user/${user._id}`,
    {},
    {
      defaultValue: { data: [] },
      source: "local"
    }
  );
  const [tempediaResult] = useFetch<{ data: any[] }>(
    `/db/tempedia/user/${user._id}`,
    {},
    {
      defaultValue: { data: [] },
      source: "local"
    }
  );
  const mostRecentlyTamed =
    tempediaResult.data.length &&
    tempediaResult.data.sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    )[0].temtemName;
  return (
    <div css={{ textAlign: "center", marginTop: 10 }}>
      <img
        css={{
          border: `2px solid ${colors.uiBlueFaded}`,
          height: 50,
          width: 50,
          borderRadius: "50%",
          margin: "0px 5px"
        }}
        src={user.redditIcon}
      />
      <TemtemText style={{ fontSize: 40 }} borderWidth={10}>
        {user.redditName}
      </TemtemText>
      <TemtemText style={{ fontSize: 20 }} borderWidth={10}>
        {`${listingsResult.data.length} Listings`}
      </TemtemText>
      <TemtemText style={{ fontSize: 20 }} borderWidth={10}>
        {`${tempediaResult.data.length} Tamed Temtem`}
      </TemtemText>
      {tempediaResult.data.length ? (
        <div>
          <TemtemPortrait
            style={{ margin: "0 auto" }}
            shape="hexagon"
            temtem={mostRecentlyTamed}
          />
          <TemtemText style={{ fontSize: 20 }} borderWidth={10}>
            {`Most recently tamed a ${mostRecentlyTamed}`}
          </TemtemText>
        </div>
      ) : null}
    </div>
  );
}

UserPage.getInitialProps = async ({ req, query }) => {
  try {
    const host = req ? req.headers.host : window.location.host;
    const res = await fetch(
      `${host.includes("localhost") ? "http" : "https"}://${host}/api/db/user/${
        query.name
      }`
    );
    if (res.ok) {
      const user = await res.json();
      return {
        user
      };
    }
    return {};
  } catch (e) {
    console.error("error", e);
    return {};
  }
};
