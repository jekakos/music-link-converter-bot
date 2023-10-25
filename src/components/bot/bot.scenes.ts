const SceneNames = {
  MyPlatform: 'my_platform',
};

export function getSceneName(scene: SceneKeyType): string | null {
  return typeof scene === 'string' ? scene : null;
}

type SceneNamesType = typeof SceneNames;
type SceneKeyType = (typeof SceneNames)[keyof typeof SceneNames];

export { SceneNames, SceneNamesType, SceneKeyType };
