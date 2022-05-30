<script>
  import axios from "axios";

  var posts = [];
  let view_post = false;
  let current__post;
  let postDetail = {};

  function log(text) {
    console.log(text);
  }

  axios.get("https://dev.to/api/articles").then(function (res) {
    new Object(res.data).forEach((element) => {
      axios.get("https://dev.to/api/articles/" + element.id).then((res) => {
        var data = res.data;
        var obj = {
          title: data.title,
          description: data.description,
          url: data.url,
          image: data.cover_image,
          id: data.id,
        };
        posts = [obj, ...posts];
      });
    });
  });

  function loadUpPost(id) {
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
        time: data.published_timestamp,
        userImg: data.user.profile_image,
      };
    });
  }
</script>

<div class="app">
  <nav
    class="navbar fixed-top navbar-light bg-light navbar-expand-lg navbar-light bg-light"
  >
    <div class="container-fluid">
      <span class="navbar-brand m-2">
        {#if view_post}
          <div
            on:click={() => {
              view_post = false;
            }}
          >
            <i class="fa fa-angle-left" />
          </div>
        {:else}
          readwebdev
        {/if}
      </span>
      <span
        on:click={() => {
          document.querySelector("body").style =
            "background: black;color:white;";
        }}
      >
        dark
      </span>
    </div>
  </nav>
  <br />
  <br />
  <br />
  {#if view_post}
    <img src={postDetail.img} class="img" alt="" />
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
      <a
        href="http://dev.to/{postDetail.username}"
        target="_blank"
        rel="noopener noreferrer"
      >
        {postDetail.userName}
      </a>
    </h4>
    <article>
      {@html postDetail.html}
    </article>
  {:else}
    <!--feed section-->
    {#each posts as post}
      <div
        class="cont m-3"
        id={post.id}
        on:click={() => {
          view_post = true;
          current__post = post.id;
          log(current__post);
          loadUpPost(current__post);
        }}
      >
        <h3>
          {post.title}
        </h3>
        {#if post.image}
          <img src={post.image} alt="cover img" class="img" />
        {/if}
        <h5>
          {post.description}
        </h5>
        <a href={"#"}> read more... </a>
      </div>
      <hr />
    {/each}
  {/if}
</div>

<style>
  .cont,
  hr {
    margin: 1rem;
    margin: auto;
    cursor: pointer;
  }

  .userImg {
    height: 30px;
    width: 30px;
    border-radius: 10px;
  }

  img {
    width: 100vw;
  }

  @media (min-width: 801px) {
    .cont,
    hr {
      width: 50vw;
    }

    .img {
      width: 50vw;
    }
  }
</style>
