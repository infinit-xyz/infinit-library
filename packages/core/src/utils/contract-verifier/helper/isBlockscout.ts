import axios from 'axios'

export const isBlockscout = async (apiUrl: string) => {
  // note: blockscout has a /v2/stats endpoint
  const url = new URL(apiUrl + '/v2/stats')
  let isBlockscout: boolean = true
  await axios
    .get(url.toString())
    .then((response: any) => {
      if (response.status === 200) {
        isBlockscout = true
      }
    })
    .catch((error: any) => {
      if (error.response.status === 404) {
        isBlockscout = false
      } else {
        throw new Error(error)
      }
    })
  return isBlockscout
}
