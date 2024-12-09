<script>
  import { buttonVariants } from '@/lib/components/ui/button/button.svelte';
</script>

<div class="flex h-screen w-full items-center justify-center">
  <div class="flex flex-col gap-2">
    <h1>Sign in</h1>
    <a
      href="/login/google"
      class={buttonVariants({
        variant: 'secondary'
      })}>Sign in with Google</a
    >
  </div>
</div>
