import { getDependencyGraph } from './getDependencyGraph'

type Sources = { [sourceName: string]: { content: string } }

export const getMinimalSources = async (sourceName: string, projectRoot: string): Promise<Sources> => {
  const dependencyGraph = await getDependencyGraph(sourceName, projectRoot)

  const resolvedFiles = dependencyGraph.getResolvedFiles().filter((resolvedFile) => resolvedFile.sourceName === sourceName)

  if (resolvedFiles.length !== 1) {
    throw new Error('should be one file')
  }

  const sources: Sources = {}
  for (const resolvedFile of dependencyGraph.entries()) {
    sources[resolvedFile[0].sourceName] = { content: resolvedFile[0].content.rawContent }
  }
  return sources
}
