<script>
  import { Router, Link, Route, navigate } from "svelte-navigator";
  import PostRenderer from "./PostRenderer.svelte";
  import Tag from "./Tag.svelte";
  import { marked } from "marked";
  import swal from "sweetalert2";
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

  //for write
  let userApiKey = localStorage.getItem("apiKey") || "";
  let titlePost = "title of the post";
  let bodyPost = "# heading \n \n content of the post you're writing about";
  let preview = false;
  let postTags;
  
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

  const toast = swal.mixin({
    toast: true,
    timer: 3000,
    timerProgressBar: true,
    position: "bottom-right",
    showConfirmButton: false,
  });

  //save the api key in local storage
  $: userApiKey, localStorage.setItem("apiKey", userApiKey);

  //auth
  import { supabase } from "./supabase";

  let user = supabase.auth.user();
  async function signup() {
    const { user, session, error } = await supabase.auth.signIn({
      provider: "google",
    });
  }

  supabase.auth.onAuthStateChange((event, session) => {
    user = supabase.auth.user();
  });
</script>

<Router>
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
            <box-icon name="arrow-back" />
          </div>
        {:else}
          dev--to
        {/if}
      </span>
      {#if user}
        <span
          on:click={() => {
            navigate("/account");
          }}
        >
          <img
            src={user.user_metadata.avatar_url}
            width="30"
            height="30"
            class="rounded"
            alt=""
          />
          {user.user_metadata.name}
        </span>

        <span class="d-flex side__nav">
          <Link to="/tags">
            <box-icon name="purchase-tag" />
          </Link>
          <Link to="/write">
            <box-icon name="pen" />
          </Link>
        </span>
      {/if}
    </div>
  </nav>
  <br />
  <br />
  <br />

  {#if !user}
    <div class="m-2">
      <div class="display-2">read articles</div>
      <div class="display-5">for free.</div>
    </div>

    <button on:click={signup} type="button" class="m-2 login-with-google-btn">
      continue with Google
    </button>
  {:else}
    <div class="app">
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
                  <box-icon name="github" type="logo" />
                </a>
              {/if}
              {#if userInfo.twitter}
                <a
                  class="a"
                  href="http://twitter.com/{userInfo.twitter}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <box-icon name="twitter" type="logo" />
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
          <img class="userImg" src={postDetail.userImg} alt="" />
          <Link to="/user/{postDetail.username}">
            {postDetail.userName}
          </Link>
        </h4>
        <h6 class="m-2">
          {#if postDetail.tags}
            <h6 class="d-flex taglist">
              <!--{#each (postDetail.tags).split(",") as elm}
              <Tag>
                {elm}
              </Tag>
            {/each}-->
            </h6>
          {/if}
        </h6>
        <article>
          {@html postDetail.html}
          <div class="rounded shadow p-3">
            <p class="m-2 h3 text-center">
              {articleReactions.likes}
              <box-icon name="heart" type="solid" style="color: #DC143C;" />
              ,
              {articleReactions.unicorn}
              <box-icon name="star" type="solid" style="color: #FFF017;" />,
              {articleReactions.readingList}
              <box-icon name="bookmarks" type="solid" style="color: #0047ab;" />
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
                <box-icon name="package" type="solid" />
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
      <Route path="/write">
        {#if !preview}
          <h1 class="display-3">Write A Post</h1>
          <label for="UserApi" class="form-label"> Api Key: </label>
          <input
            placeholder="api key from https://dev.to/settings/account"
            bind:value={userApiKey}
            class="form-control"
            id="UserApi"
          />
          <label for="PostTitle" class="form-label"> Post title: </label>
          <input
            placeholder="title of the post"
            bind:value={titlePost}
            class="form-control"
            id="PostTitle"
          />
          <label for="PostBody" class="form-label"> Post Body: </label>
          <textarea
            id="PostBody"
            bind:value={bodyPost}
            placeholder="content of the post"
          />
          <label for="PostTags" class="form-label"> Post Tags: </label>
          <input
            placeholder="javascript,webdev,codenewbie,tutorial (only 4)"
            bind:value={postTags}
            class="form-control"
            id="PostTags"
          />
          <br />
          <!-- svelte-ignore missing-declaration -->
          <button
            class="btn btn-primary"
            on:click={() => {
              if (userApiKey !== (undefined || null || "")) {
                var url = "https://write-to-dev.vercel.app/api/publish";

                var xhr = new XMLHttpRequest();
                xhr.open("POST", url);

                xhr.setRequestHeader("Content-Type", "application/json");

                xhr.onreadystatechange = function () {
                  if (xhr.readyState === 4) {
                    if (JSON.parse(xhr.responseText).status == 200) {
                      toast.fire({
                        title: "failed",
                        icon: "error",
                      });
                      setTimeout(() => {
                        navigate("/post/" + JSON.parse(xhr.responseText).id);
                      }, 1000);
                    } else if (JSON.parse(xhr.responseText).status == 422) {
                      toast.fire({
                        title: "rate limited",
                        icon: "warning",
                      });
                    } else {
                      toast.fire({
                        title: "failed",
                        icon: "error",
                      });
                    }
                  }
                };

                var data = JSON.stringify({
                  title: titlePost,
                  body: bodyPost,
                  api_key: userApiKey,
                  tags: postTags.replace(/ /, "").split(",") || [],
                });

                xhr.send(data);
              } else {
                toast.fire({
                  title: "no api key!",
                  icon: "error",
                });
              }
            }}
          >
            publish
          </button>
        {:else}
          {@html marked.parse(bodyPost)}
        {/if}
        <button
          class="btn btn-warning"
          on:click={() => {
            if (!preview) {
              preview = true;
            } else {
              preview = false;
            }
          }}
        >
          {#if preview}
            exit
          {/if}
          preview
        </button>
      </Route>
      <Route path="/account">
        <div class="m-3">
          <div class="display-4">sign out</div>
          <br />
          <button
            class="btn btn-danger"
            on:click={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                alert("err" + error);
              }
              navigate("/");
            }}
          >
            sign out
          </button>
        </div>
      </Route>
    </div>
    <!--footer-->
    <div class="mt-2" />
    <footer class="text-center p-5 rounded m-2 bg-light">
      dev--to (v0.1.0)
    </footer>
    <div class="mb-2" />
  {/if}
</Router>

<style global>
  * {
    font-family: "Raleway", sans-serif;
  }

  .side__nav {
    gap: 10px;
  }

  textarea {
    width: 100%;
    height: 40vh;
  }

  .login-with-google-btn {
    transition: background-color 0.3s, box-shadow 0.3s;

    padding: 12px 16px 12px 42px;
    border: none;
    border-radius: 3px;
    box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.25);

    color: #757575;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;

    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=);
    background-color: white;
    background-repeat: no-repeat;
    background-position: 12px 11px;
  }
</style>
