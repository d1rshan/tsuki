# Mobile dialog assessment

Shared dialogs use a bottom sheet on narrow screens; `mobileSheet={false}` keeps the centered presentation. The drag handle is at the top of the scrollable surface, so it returns when the user scrolls back to the top. Dragging only the handle avoids competing with text selection, fields, rich content, and crop gestures.

- Auth forms and email verification use the shared sheet; their existing focus return and view switching remain in the auth provider.
- Image crop retains its own pointer interactions. Its existing busy guard receives the same close request from a drag, Escape, or backdrop.
- Rich-content link, spoiler, insert, and GIF dialogs use sheets. Long content can scroll; the GIF picker retains its internal scrolling.
- Discard confirmation remains a nested dialog. Dismissing it invokes its existing keep-editing handler.
- Media details opts out: its full-screen surface, motion, history, close button, and focus return remain under the media modal.
