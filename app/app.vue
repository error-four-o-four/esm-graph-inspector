<template>
  <UApp>
    <div class="w-full h-full">
      <div class="fixed w-full px-4 py-6 flex">
        <div class="relative w-2xs min-w-2xs">
          <div class="absolute w-full">
            <AppSideBar />
          </div>
        </div>
        <AppTopBar />
      </div>

      <main class="w-full h-full p-8 flex items-center justify-center">
        <div>
          Some content ...
        </div>
      </main>
    </div>
  </UApp>
</template>
