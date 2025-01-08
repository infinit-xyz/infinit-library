import { getArtifacts } from '@utils/artifact'

const artifacts = await getArtifacts()

const fqNames = await artifacts.getAllFullyQualifiedNames()
console.log(fqNames.length)
let count = 0
for (let i = 0; i < fqNames.length; i++) {
  console.log(fqNames[i])
  if (fqNames[i].includes('core-v2')) {
    count++
  }
}
console.log(count)
// console.log(fqNames)
// const buildInfo = await artifacts.getBuildInfo(fqNames[549]);

// console.log(buildInfo)
