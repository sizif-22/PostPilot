import React from 'react'
import { Command } from 'cmdk'
export const CPDialog = ({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) => {
  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 bg-stone-950/50 outline-0"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-[20vh] left-[50%] translate-x-[-50%] h-[60vh] inset-0 bg-stone-950/70 rounded-lg"
      >
      </div>
    </Command.Dialog>
  )
}

