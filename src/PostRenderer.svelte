<script>
  export let posts;
  import { Router, Link, Route, navigate } from "svelte-navigator";
</script>

{#each posts as post}
  <div class="cont shadow p-3 mb-3 mt-2 bg-body rounded m-auto a">
    <Link to="/post/{post.id}">
      <div class="" id={post.id}>
        <h3>
          {post.title}
        </h3>
        {#if post.image || post.cover_image}
          <img
            class="img-fluid"
            src={post.image || post.cover_image}
            alt="cover img"
          />
        {/if}
        <h5 class="desc">
          {post.description}
        </h5>
        {#if post.tags}
          <h6>
            tagged with {post.tags}
          </h6>
        {/if}
      </div>
    </Link>
  </div>
{/each}
