import { TextAttributes } from "@opentui/core"
import { onMount } from "solid-js"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/solid"
import { useTheme } from "@tui/context/theme"
import { useDialog } from "@tui/ui/dialog"
import { useToast } from "@tui/ui/toast"
import { Flag } from "@opencode-ai/core/flag/flag"
import * as Selection from "@tui/util/selection"

export function DialogPinnedContent(props: { text: string }) {
  const dialog = useDialog()
  const { theme } = useTheme()
  const dimensions = useTerminalDimensions()
  const renderer = useRenderer()
  const toast = useToast()

  onMount(() => {
    dialog.setSize("large")
  })

  useKeyboard((evt) => {
    if (evt.name === "return") {
      evt.preventDefault()
      evt.stopPropagation()
      dialog.clear()
    }
  })

  return (
    <box
      paddingLeft={2}
      paddingRight={2}
      gap={1}
      onMouseUp={
        Flag.OPENCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT
          ? undefined
          : () => Selection.copy(renderer, toast)
      }
    >
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text} selectable={false}>
          Message
        </text>
        <text fg={theme.textMuted} selectable={false} onMouseUp={() => dialog.clear()}>
          esc
        </text>
      </box>
      <scrollbox
        maxHeight={Math.floor(dimensions().height / 2)}
        paddingBottom={1}
        scrollbarOptions={{ visible: false }}
      >
        <text fg={theme.text}>{props.text}</text>
      </scrollbox>
    </box>
  )
}
