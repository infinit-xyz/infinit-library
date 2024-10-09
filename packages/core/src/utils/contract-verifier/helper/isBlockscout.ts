import axios from 'axios'

/**
 * Checks if the given API URL is a Blockscout instance.
 *
 * @param apiUrl - The API URL to check.
 * @returns A promise that resolves to a boolean indicating whether the API URL is a Blockscout instance.
 * @throws Will throw an error if the API returns a status other than 200 or 404.
 */
export const isBlockscout = async (apiUrl: string): Promise<boolean> => {
  // note: blockscout has a /v2/stats endpoint
  const url = new URL(apiUrl + '/v2/stats')

  return axios
    .get(url.toString())
    .then((response) => {
      if (response.status === 200) {
        return true
      }

      throw new Error(`Blockscout API V2 returned status ${response.status}`)
    })
    .catch((error: any) => {
      if (error.response.status === 404) {
        return false
      } else {
        throw new Error(error)
      }
    })
}
