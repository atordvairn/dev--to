<script>
  import { Router, Link, Route, navigate } from "svelte-navigator";
  import PostRenderer from "./PostRenderer.svelte";
  import axios from "axios";
  import "./global.css";

  var posts = [];
  let postDetail = {};
  let location_app;
  let userInfo = {};
  let userArticles = [];
  let tags = [];
  let taggedArticles = [];
  let articleComment = [];
  let articleReactions = {};
  let dataPostPage = [];
  let currentPageForDash = 1;

  function log(text) {
    console.log(text);
  }

  axios.get("https://dev.to/api/tags?per_page=200").then((res) => {
    let data = res.data;
    data.forEach((tag) => {
      tags = [
        {
          name: tag.name,
          id: tag.id,
          bg: tag.bg_color_hex,
          color: tag.text_color_hex,
        },
        ...tags,
      ];
    });
  });

  axios.get("https://dev.to/api/articles/?per_page=20").then(function (res) {
    res.data.forEach((element) => {
      let data = element;
      var obj = {
        title: data.title,
        description: data.description,
        url: data.url,
        image: data.cover_image,
        id: data.id,
        tags: data.tags,
      };
      posts = [obj, ...posts];
    });
  });

  function loadUpPost(id) {
    postDetail = {
      title: "loading..",
      description: "loading..",
      url: "loading..",
      image: "loading..",
      html: "loading..",
      tags: "loading..",
      username: "loading..",
      userName: "loading..",
      reactions: "loading..",
      time: "loading..",
      userImg: "loading..",
    };
    axios.get("https://dev.to/api/articles/" + id).then((res) => {
      var data = res.data;
      postDetail = {
        title: data.title,
        description: data.description,
        url: data.url,
        image: data.cover_image,
        id: data.id,
        html: data.body_html,
        tags: data.tags,
        username: data.user.username,
        userName: data.user.name,
        reactions: data.public_reactions_count,
        time: data.published_timestamp,
        userImg: data.user.profile_image,
      };
    });

    axios.get("https://dev.to/reactions?article_id=" + id).then((res) => {
      let data = res.data;
      articleReactions = {
        likes: data.article_reaction_counts[0].count,
        readingList: data.article_reaction_counts[1].count,
        unicorn: data.article_reaction_counts[2].count,
      };
    });
  }

  async function getArticleTagged(tag) {
    taggedArticles = [];
    axios
      .get("https://dev.to/api/articles?per_page=100&tag=" + tag)
      .then((res) => {
        let data = res.data;
        taggedArticles = data;
      });
  }

  async function loadUser(username) {
    userInfo = {
      username: "loading..",
      name: "loading..",
      img: "loading..",
      description: "loading..",
      joined: "loading..",
      github: "loading..",
      twitter: "loading..",
    };
    axios
      .get("https://dev.to/api/users/by_username?url=" + username)
      .then((res) => {
        let data = res.data;

        userInfo = {
          username: username,
          name: data.name,
          img: data.profile_image,
          description: data.summary,
          joined: data.joined_at,
          github: data.github_username,
          twitter: data.twitter_username,
        };
      });

    userArticles = [];

    axios
      .get("https://dev.to/api/articles?username=" + username)
      .then((res) => {
        let data = res.data;
        userArticles = data;
      });
  }

  function loadUpComments(id) {
    articleComment = [];
    axios.get("https://dev.to/api/comments?a_id=" + id).then((res) => {
      let data = res.data;
      articleComment = data;
    });
  }

  function loadPostsPage(page) {
    axios
      .get("https://dev.to/api/articles?per_page=100&page=" + page)
      .then((res) => {
        let data = res.data;
        dataPostPage = data;
      });
  }

  setInterval(() => {
    location_app = location.pathname;
  }, 500);
</script>

<Router>
  <div class="app">
    <nav class="navbar fixed-top navbar-light">
      <div class="container-fluid">
        <span class="navbar-brand m-2">
          {#if location_app !== "/"}
            <div
              on:click={() => {
                //window.history.back()
                navigate("/");
              }}
            >
              <i class="fa fa-angle-left" />
            </div>
          {:else}
            dev--to
          {/if}
        </span>
        <!--span class="m-auto">
          page:
          {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as page}
            <Link to={"/page/" + page}>
              {page}
            </Link>
          {/each}
        </span-->
        <span>
          <Link to="/tags">tags</Link>
        </span>
      </div>
    </nav>
    <br />
    <br />
    <br />
    <Route path="/">
      <div class="cont rounded shadow p-3">
        <h3>load:</h3>
        <button
          class="btn btn-primary"
          on:click={() => {
            posts = [];
            axios
              .get("https://dev.to/api/articles/?per_page=100&top=2")
              .then(function (res) {
                res.data.forEach((element) => {
                  let data = element;
                  var obj = {
                    title: data.title,
                    description: data.description,
                    url: data.url,
                    image: data.cover_image,
                    id: data.id,
                    tags: data.tags,
                  };
                  posts = [...posts, obj];
                });
              });
          }}
        >
          top
        </button>

        <button
          class="btn btn-primary"
          on:click={() => {
            posts = [];
            axios
              .get("https://dev.to/api/articles/?per_page=100&state=fresh")
              .then(function (res) {
                res.data.forEach((element) => {
                  let data = element;
                  var obj = {
                    title: data.title,
                    description: data.description,
                    url: data.url,
                    image: data.cover_image,
                    id: data.id,
                    tags: data.tags,
                  };
                  posts = [...posts, obj];
                });
              });
          }}
        >
          fresh
        </button>

        <button
          class="btn btn-primary"
          on:click={() => {
            posts = [];
            axios
              .get("https://dev.to/api/articles/?per_page=100&state=rising")
              .then(function (res) {
                res.data.forEach((element) => {
                  let data = element;
                  var obj = {
                    title: data.title,
                    description: data.description,
                    url: data.url,
                    image: data.cover_image,
                    id: data.id,
                    tags: data.tags,
                  };
                  posts = [...posts, obj];
                });
              });
          }}
        >
          rising posts
        </button>

        <button
          class="btn btn-primary"
          on:click={() => {
            posts = [];
            axios
              .get("https://dev.to/api/articles/?per_page=100")
              .then(function (res) {
                res.data.forEach((element) => {
                  let data = element;
                  var obj = {
                    title: data.title,
                    description: data.description,
                    url: data.url,
                    image: data.cover_image,
                    id: data.id,
                    tags: data.tags,
                  };
                  posts = [...posts, obj];
                });
              });
          }}
        >
          all posts
        </button>
      </div>
      <div>
        <PostRenderer {posts} />
      </div>
      <div class="text-center">
        <button
          class="btn btn-primary m-auto"
          on:click={() => {
            currentPageForDash += 1;
            axios
              .get(
                "https://dev.to/api/articles/?per_page=10&page=" +
                  currentPageForDash
              )
              .then(function (res) {
                log(res.data);
                res.data.forEach((element) => {
                  let data = element;
                  var obj = {
                    title: data.title,
                    description: data.description,
                    url: data.url,
                    image: data.cover_image,
                    id: data.id,
                    tags: data.tags,
                  };
                  posts = [...posts, obj];
                });
              });
          }}
        >
          load more
        </button>
      </div>
    </Route>
    <Route path="/user/:username" let:params>
      <div class={loadUser(params.username)}>
        <div class="m-3 text-center">
          <img class="userImage" src={userInfo.img} alt="" />
          <h4>
            {userInfo.name}
          </h4>
          <h6>
            {userInfo.description}
          </h6>
          <div class="gap-2 m-2 flex">
            {#if userInfo.github}
              <a
                class="a"
                href="http://github.com/{userInfo.github}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="fa-brands fa-github" />
              </a>
            {/if}
            {#if userInfo.twitter}
              <a
                class="a"
                href="http://twitter.com/{userInfo.twitter}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="fa-brands fa-twitter" />
              </a>
            {/if}
          </div>
        </div>
      </div>
      <div>
        <PostRenderer posts={userArticles} />
      </div>
    </Route>
    <Route path="/post/:id" let:params>
      <img
        src={postDetail.img}
        class="img-fluid {loadUpPost(params.id)}"
        alt=""
      />
      <h1>
        {postDetail.title}
      </h1>
      <h4>
        written at: {new Date(postDetail.time).toLocaleDateString() +
          "-" +
          new Date(postDetail.time).toLocaleTimeString()}
      </h4>
      <h4 style="margin: auto;display: flex;gap: 0.35rem;">
        by:
        <img class="userImg" src={postDetail.userImg} alt="" />
        <Link to="/user/{postDetail.username}">
          {postDetail.userName}
        </Link>
      </h4>
      <h6 class="m-2">
        {#if postDetail.tags}
          tagged: {postDetail.tags}
        {/if}
      </h6>
      <article>
        {@html postDetail.html}
        <div class="rounded shadow p-3">
          <p class="m-2 h3 text-center">
            {articleReactions.likes}
            <i class="fas fa-heart" style="color: #DC143C;" />
            ,
            {articleReactions.unicorn}
            <i class="fas fa-star" style="color: #FFF017;" />,
            {articleReactions.readingList}
            <i class="fas fa-bookmark" style="color: #0047ab;" />
          </p>
        </div>
        <div class="cont mt-4">
          <h3 class="m-2">Comments:</h3>
        </div>
        <div class="cont {loadUpComments(postDetail.id)}">
          {#if articleComment.length !== 0}
            {#each articleComment as comment}
              <div class="card m-2 cont">
                <div class="card-body">
                  <h5 class="card-title">
                    <Link to={"/user/" + comment.user.username}>
                      {comment.user.name}
                    </Link>
                    <h6>
                      at: {new Date(comment.created_at).toLocaleDateString()}
                    </h6>
                  </h5>
                  <p>
                    {@html comment.body_html}
                  </p>
                </div>
              </div>
            {/each}
          {:else}
            <div class="cont m-2">
              <i class="fa-solid fa-question" />
              No Comments!
            </div>
          {/if}
        </div>
      </article>
      <div class="mb-3 pb-3" />
    </Route>
    <Route path="/tags">
      {#each tags as tag}
        <Link to="/tagged/{tag.name}">
          <div
            class="badge"
            style="color: {tag.color || 'black'};background: {tag.bg ||
              '#c4c4c4'};"
          >
            {tag.name}
          </div>
        </Link>
      {/each}
    </Route>
    <Route path="/tagged/:tag" let:params>
      <div class={getArticleTagged(params.tag)}>
        <PostRenderer posts={taggedArticles} />
      </div>
    </Route>
    <Route path="/page/:n" let:params>
      <div class={loadPostsPage(params.n)}>
        <PostRenderer posts={dataPostPage} />
      </div>
    </Route>
  </div>
  <!--footer-->
  <div class="p-4 m-4" />
</Router>

<style global>
  * {
    font-family: "Raleway", sans-serif;
  }
</style>
