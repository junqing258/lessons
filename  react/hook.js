/**
 * 通过极简方式实现，便于理解react hook
 */

let workInProgressHook = null;
let workInProgress = null;
let rootContainer;

function renderDom(componentFn, container) {
  rootContainer = container;

  const fiber = {
    stateNode: componentFn,
    memoizedState: [],
  };
  workInProgress = fiber;

  workInProgress.isMount = true;
  schedule();
  workInProgress.isMount = false;

  /**
   * 初始化合成事件
   */
  rootContainer.addEventListener(
    "click",
    (e) => {
      e.target?.fiber?.onClick(e);
    },
    false
  );
}

/**
 * 调度器
 */
function schedule() {
  const vNode = render(workInProgress);
  commitRoot(workInProgress, vNode);
}

/**
 * render 阶段
 */
function render(workInProgress) {
  workInProgress.cursor = 0;
  const vNode = workInProgress.stateNode();
  return vNode;
}

/**
 * 
 * commit 阶段
 */
function commitRoot(workInProgress, ele) {
  const { tag, child } = ele;
  const { isMount } = workInProgress;
  if (isMount) {
    node = document.createElement(tag);
    workInProgress.node = node;
    rootContainer.appendChild(node);
  }
  node.fiber = ele;
  node.innerHTML = child;
}

function useState(initialValue) {
  const { memoizedState, cursor, isMount } = workInProgress;
  let hook;
  if (isMount) {
    const setState = (newState) => {
      memoizedState[cursor] = {
        ...memoizedState[cursor],
        memoizedState: newState,
      };
      /* dispatch 触发调度 */
      schedule();
    };
    hook = {
      memoizedState: initialValue,
      dispatchAction: setState,
    };
    memoizedState[cursor] = hook;
  } else {
    hook = memoizedState[cursor];
  }
  workInProgress.cursor++;
  return [hook.memoizedState, hook.dispatchAction];
}

function useEffect(callback, depArray) {
  const { memoizedState, cursor, isMount } = workInProgress;
  let hook;
  if (isMount) {
    hook = {
      deps: depArray,
      create: callback,
    };
    memoizedState[cursor] = hook;
    setTimeout(callback);
  } else {
    hook = memoizedState[cursor];
    const { deps, create } = hook;
    const hasChangedDeps = deps
      ? !depArray.every((el, i) => el === deps[i])
      : true;
    if (hasChangedDeps) {
      callback();
    }
  }
  workInProgress.cursor++;
}
