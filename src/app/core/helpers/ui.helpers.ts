const blocker = document.createElement('div');
blocker.classList.add('ui-blocker');
blocker.innerHTML = `<i class="fad fa-spinner-third fa-spin"></i>`;
// let counter = 0;

export function lockUI(waitFor?: Promise<any>) {
  try {
    // counter++;
    document?.body?.appendChild(blocker);
    waitFor?.finally(() => unlockUI());
  } catch (e) {}
}

export function unlockUI() {
  // if(!counter) return;
  try {
    // counter--;
    // if(counter === 0) document?.body?.removeChild(blocker);
    document?.body?.removeChild(blocker);
  } catch (e) {}
}
