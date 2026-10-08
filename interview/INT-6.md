# INT-6: the web page

The web sends `organizationId` and `actorId` as mutation variables at all, and a failed save leaves the picked value on screen.

Acceptance:
- The mutation sends only `systemId` and `riskLevel`.
- After a failed save the row shows the stored value, and the error stays visible.
- The tour still anchors to its four elements.

Question for the conversation: what belongs in a React Query key, what belongs in the URL, and what belongs in neither?
