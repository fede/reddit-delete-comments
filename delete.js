const ENDPOINT = "https://gql-fed.reddit.com";
const TOKEN = "";
const USERNAME = "";
const DAYS = 45;
const PAGINATION_LIMIT = 100;

const PERSISTED_QUERY_GET_COMMENTS = {
  persistedQuery: {
    sha256Hash:
      "1f7b7a3bef7b7a37d49b513b3e6407348565ede5398ad8960839123f01b8d901",
    version: 1,
  },
}

const PERSISTED_QUERY_DELETE_COMMENT = {
  persistedQuery: {
    sha256Hash:
      "877e3ef375aa28e71210d58fac848c0aefe90c8373cafe7f3115bfd5cbd8b983",
    version: 1,
  },
}

const DEFAULT_COMMENT_VARS = {
  includeCommentStats: false,
  includePaidSubscriberBadge: false,
  name: USERNAME,
  range: "ALL",
  sort: "NEW",
};

async function getComments(after = null) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      extensions: PERSISTED_QUERY_GET_COMMENTS,
      operationName: "UserComments",
      variables: {
        ...DEFAULT_COMMENT_VARS,
        after: after,
      },
    }),
  });

  const json = await res.json();

  return {
    comments: json.data.redditorInfoByName.comments.edges,
    hasNextPage: json.data.redditorInfoByName.comments.pageInfo.hasNextPage,
    endCursor: json.data.redditorInfoByName.comments.pageInfo.endCursor,
  };
}

async function deleteCommentsOlderThan(days, comments) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  for (const comment of comments) {
    const createdAt = new Date(comment.node.createdAt).getTime();
    console.log(
      `Checking comment ${comment.node.id} created at ${comment.node.createdAt}`
    );
    if (createdAt < cutoff) {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          extensions: PERSISTED_QUERY_DELETE_COMMENT,
          operationName: "DeleteComment",
          variables: {
            pk: comment.node.id,
          },
        }),
      });
      const json = await res.json();
      if (json.errors) {
        console.error(
          `Error deleting comment ${comment.node.id}:`,
          json.errors
        );
      } else {
        console.log(
          `Deleted comment ${comment.node.id} created at ${comment.node.createdAt}`
        );
      }
    }
  }
}

(async () => {})();
let response = {
  comments: [],
  hasNextPage: true,
  endCursor: null,
};
let pages = 0;
do {
  response = await getComments(response.endCursor);
  deleteCommentsOlderThan(DAYS, response.comments);
  pages++;
} while (response.hasNextPage && pages < PAGINATION_LIMIT);
