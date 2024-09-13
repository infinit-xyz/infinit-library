import { SpawnOptionsWithoutStdio, spawn } from 'child_process'

/**
 * Callback for spawn process.
 */
type SpawnCallback = {
  /**
   * Callback for close event.
   */
  onClose?: (code: number) => void
  /**
   * Callback for stderr event.
   */
  onStdErr?: (data: Buffer) => void
  /**
   * Callback for stdout event.
   */
  onStdOut?: (data: Buffer) => void
}

/**
 * Function to run a command and wait for it to finish.
 * @param command The command to run.
 * @param args The arguments to pass to the command.
 * @param options The options to pass to the spawn process.
 * @param callback The callback to call when the process finishes.
 * @returns A promise that resolves when the process finishes.
 */
export const runSpawn = (
  command: string,
  args: string[],
  options: SpawnOptionsWithoutStdio,
  { onClose, onStdErr, onStdOut }: SpawnCallback,
) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
    })

    child.on('close', (code: number) => {
      onClose?.(code)

      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        })
        return
      }
      // normal exit
      resolve('')
    })

    child.stderr?.on('data', (data: Buffer) => {
      onStdErr?.(data)
    })

    child.stdout?.on('data', (data: Buffer) => {
      onStdOut?.(data)
    })

    child.on('error', (err) => {
      reject(err)
    })
  })
}
