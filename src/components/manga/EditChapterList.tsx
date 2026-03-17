'use client'

import { useState, useCallback, useTransition, useRef, useId } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableChapterRow } from './SortableChapterRow'
import { MultiDragOverlay } from './DragOverlay'
import { Button } from '@/components/ui/Button'
import { LoadingToast } from '@/components/ui/LoadingToast'
import {
  markChapterAction,
  hideChapterAction,
  showAllChaptersAction,
  markAllChaptersAction,
  reorderChaptersAction,
  resyncMangaAction,
  dedupMangaAction,
} from '@/app/(frontend)/actions/manga'

// Action messages for the loading toast
const ACTION_MESSAGES = {
  'mark-read': 'Marking as read...',
  'mark-unread': 'Marking as unread...',
  'bulk-mark-read': 'Marking selected as read...',
  'bulk-mark-unread': 'Marking selected as unread...',
  'hide': 'Hiding chapter...',
  'bulk-hide': 'Hiding selected chapters...',
  'reorder': 'Saving new order...',
  'mark-all-read': 'Marking all as read...',
  'mark-all-unread': 'Marking all as unread...',
  'show-all': 'Restoring chapters...',
  'resync': 'Resyncing manga...',
  'dedup': 'Removing duplicates...',
} as const

type ActionType = keyof typeof ACTION_MESSAGES

export interface SerializedChapter {
  _id: string
  mangaPath: string
  chapterPath: string
  name: string
  index: number
  finalIndex: number
  newIndex: number
  read: boolean
  readAt: string | null
  hidden: boolean
  seen: boolean
  lastUpdated: string
}

interface EditChapterListProps {
  chapters: SerializedChapter[]
  mangaSlug: string
}

export function EditChapterList({ chapters: initialChapters, mangaSlug }: EditChapterListProps) {
  const dndId = useId()
  const [chapters, setChapters] = useState(initialChapters)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null)
  const lastSelectedIndex = useRef<number | null>(null)
  const lastShiftRange = useRef<[number, number] | null>(null)

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [draggedIds, setDraggedIds] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === chapters.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(chapters.map((ch) => ch._id)))
    }
  }, [chapters, selectedIds.size])

  const handleSelectOne = useCallback((chapterId: string, checked: boolean) => {
    if (checked) {
      const idx = chapters.findIndex((ch) => ch._id === chapterId)
      if (idx !== -1) lastSelectedIndex.current = idx
    }
    lastShiftRange.current = null
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(chapterId)
      } else {
        next.delete(chapterId)
      }
      return next
    })
  }, [chapters])

  const handleRowClick = useCallback(
    (chapterId: string, event: React.MouseEvent) => {
      const clickedIndex = chapters.findIndex((ch) => ch._id === chapterId)
      if (clickedIndex === -1) return

      if (event.shiftKey) {
        // Clear browser text selection caused by shift+click
        window.getSelection()?.removeAllRanges()

        if (lastSelectedIndex.current !== null) {
          // Remove previous shift-range before applying new one
          if (lastShiftRange.current) {
            const [prevStart, prevEnd] = lastShiftRange.current
            setSelectedIds((prev) => {
              const next = new Set(prev)
              for (let i = prevStart; i <= prevEnd; i++) {
                next.delete(chapters[i]._id)
              }
              // Re-add the anchor itself
              if (lastSelectedIndex.current !== null) {
                next.add(chapters[lastSelectedIndex.current]._id)
              }
              // Add the new range
              const start = Math.min(lastSelectedIndex.current!, clickedIndex)
              const end = Math.max(lastSelectedIndex.current!, clickedIndex)
              for (let i = start; i <= end; i++) {
                next.add(chapters[i]._id)
              }
              return next
            })
          } else {
            // No previous shift-range, just select the new range
            const start = Math.min(lastSelectedIndex.current, clickedIndex)
            const end = Math.max(lastSelectedIndex.current, clickedIndex)
            setSelectedIds((prev) => {
              const next = new Set(prev)
              for (let i = start; i <= end; i++) {
                next.add(chapters[i]._id)
              }
              return next
            })
          }
          // Track this shift-range for next shift+click
          const start = Math.min(lastSelectedIndex.current, clickedIndex)
          const end = Math.max(lastSelectedIndex.current, clickedIndex)
          lastShiftRange.current = [start, end]
        } else {
          // No anchor — just select this row and set anchor
          setSelectedIds((prev) => {
            const next = new Set(prev)
            next.add(chapterId)
            return next
          })
          lastSelectedIndex.current = clickedIndex
          lastShiftRange.current = null
        }
        // Don't update anchor on shift+click — anchor stays fixed
      } else {
        // Ctrl/Cmd+Click: toggle single row
        const isCurrentlySelected = selectedIds.has(chapterId)
        setSelectedIds((prev) => {
          const next = new Set(prev)
          if (isCurrentlySelected) {
            next.delete(chapterId)
          } else {
            next.add(chapterId)
          }
          return next
        })
        lastSelectedIndex.current = clickedIndex
        lastShiftRange.current = null
      }
    },
    [chapters, selectedIds]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeId = event.active.id as string
      setActiveDragId(activeId)

      if (selectedIds.has(activeId) && selectedIds.size > 1) {
        setDraggedIds(new Set(selectedIds))
      } else {
        setDraggedIds(new Set([activeId]))
      }
    },
    [selectedIds]
  )

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
    setDraggedIds(new Set())
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      setActiveDragId(null)
      setDraggedIds(new Set())

      if (!over || active.id === over.id) return

      const activeId = active.id as string
      const overId = over.id as string
      const isMultiDrag = selectedIds.has(activeId) && selectedIds.size > 1

      let newOrder: SerializedChapter[]

      if (isMultiDrag) {
        const movingIds = new Set(selectedIds)
        // Extract moving items preserving relative order
        const movingItems = chapters.filter((ch) => movingIds.has(ch._id))
        const remaining = chapters.filter((ch) => !movingIds.has(ch._id))

        // If dropped on a sibling in the moving set, bail
        if (movingIds.has(overId)) return

        const overIndex = remaining.findIndex((ch) => ch._id === overId)
        if (overIndex === -1) return

        // Determine insertion: if dragging down insert after, if up insert before
        const oldActiveIndex = chapters.findIndex((ch) => ch._id === activeId)
        const oldOverIndex = chapters.findIndex((ch) => ch._id === overId)
        const insertIndex = oldActiveIndex < oldOverIndex ? overIndex + 1 : overIndex

        remaining.splice(insertIndex, 0, ...movingItems)
        newOrder = remaining

        // Clear selection after multi-drag
        setSelectedIds(new Set())
      } else {
        const oldIndex = chapters.findIndex((ch) => ch._id === activeId)
        const newIndex = chapters.findIndex((ch) => ch._id === overId)
        newOrder = arrayMove(chapters, oldIndex, newIndex)
      }

      // Update local state immediately
      setChapters(newOrder)
      setPendingAction('reorder')

      // Submit to server
      startTransition(async () => {
        await reorderChaptersAction(
          newOrder.map((ch, idx) => ({
            id: ch._id,
            newIndex: idx,
          }))
        )
        setPendingAction(null)
      })
    },
    [chapters, selectedIds]
  )

  const handleMarkRead = useCallback(
    (chapterId: string, asRead: boolean) => {
      // Optimistic update
      setChapters((items) =>
        items.map((ch) =>
          ch._id === chapterId
            ? { ...ch, read: asRead, readAt: asRead ? new Date().toISOString() : null }
            : ch
        )
      )
      setPendingAction(asRead ? 'mark-read' : 'mark-unread')

      startTransition(async () => {
        await markChapterAction(chapterId, asRead)
        setPendingAction(null)
      })
    },
    []
  )

  const handleHide = useCallback(
    (chapterId: string) => {
      // Optimistic update - remove from list
      setChapters((items) => items.filter((ch) => ch._id !== chapterId))
      setPendingAction('hide')

      startTransition(async () => {
        await hideChapterAction(chapterId, mangaSlug)
        setPendingAction(null)
      })
    },
    [mangaSlug]
  )

  const handleMarkAllRead = useCallback(() => {
    // Optimistic update
    setChapters((items) =>
      items.map((ch) => ({ ...ch, read: true, readAt: new Date().toISOString() }))
    )
    setPendingAction('mark-all-read')

    startTransition(async () => {
      await markAllChaptersAction(mangaSlug, true)
      setPendingAction(null)
    })
  }, [mangaSlug])

  const handleMarkAllUnread = useCallback(() => {
    // Optimistic update
    setChapters((items) => items.map((ch) => ({ ...ch, read: false, readAt: null })))
    setPendingAction('mark-all-unread')

    startTransition(async () => {
      await markAllChaptersAction(mangaSlug, false)
      setPendingAction(null)
    })
  }, [mangaSlug])

  const handleShowAll = useCallback(() => {
    setPendingAction('show-all')
    startTransition(async () => {
      await showAllChaptersAction(mangaSlug)
      setPendingAction(null)
    })
  }, [mangaSlug])

  const handleResync = useCallback(() => {
    setPendingAction('resync')
    startTransition(async () => {
      await resyncMangaAction(mangaSlug)
      setPendingAction(null)
    })
  }, [mangaSlug])

  const handleDedup = useCallback(() => {
    setPendingAction('dedup')
    startTransition(async () => {
      await dedupMangaAction(mangaSlug)
      setPendingAction(null)
    })
  }, [mangaSlug])

  // Bulk operations
  const handleBulkMarkRead = useCallback(() => {
    if (selectedIds.size === 0) return

    // Optimistic update
    setChapters((items) =>
      items.map((ch) =>
        selectedIds.has(ch._id)
          ? { ...ch, read: true, readAt: new Date().toISOString() }
          : ch
      )
    )
    setPendingAction('bulk-mark-read')

    startTransition(async () => {
      for (const id of selectedIds) {
        await markChapterAction(id, true)
      }
      setPendingAction(null)
    })

    setSelectedIds(new Set())
  }, [selectedIds])

  const handleBulkMarkUnread = useCallback(() => {
    if (selectedIds.size === 0) return

    // Optimistic update
    setChapters((items) =>
      items.map((ch) =>
        selectedIds.has(ch._id) ? { ...ch, read: false, readAt: null } : ch
      )
    )
    setPendingAction('bulk-mark-unread')

    startTransition(async () => {
      for (const id of selectedIds) {
        await markChapterAction(id, false)
      }
      setPendingAction(null)
    })

    setSelectedIds(new Set())
  }, [selectedIds])

  const handleBulkHide = useCallback(() => {
    if (selectedIds.size === 0) return

    // Optimistic update - remove from list
    setChapters((items) => items.filter((ch) => !selectedIds.has(ch._id)))
    setPendingAction('bulk-hide')

    startTransition(async () => {
      for (const id of selectedIds) {
        await hideChapterAction(id, mangaSlug)
      }
      setPendingAction(null)
    })

    setSelectedIds(new Set())
  }, [selectedIds, mangaSlug])

  if (chapters.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={handleShowAll} disabled={isPending}>
            Show All & Reset Order
          </Button>
        </div>
        <div className="manga-panel p-8 text-center opacity-70">
          No visible chapters. Click &quot;Show All & Reset Order&quot; to reveal hidden chapters.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
      {/* Action Toolbar */}
      <div className="sticky top-[56px] z-10 flex flex-wrap items-center gap-2 p-4 manga-panel">
        {/* Bulk Actions - shown when items are selected */}
        {selectedIds.size > 0 ? (
          <>
            <span className="text-sm font-bold mr-2">
              {selectedIds.size} selected:
            </span>
            <Button variant="ghost" size="sm" onClick={handleBulkHide} disabled={isPending}>
              Hide
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBulkMarkUnread} disabled={isPending}>
              Mark Unread
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBulkMarkRead} disabled={isPending}>
              Mark Read
            </Button>
            <div className="w-px h-6 bg-[var(--manga-border)] mx-2" />
          </>
        ) : null}

        {/* Global Actions */}
        <Button variant="ghost" size="sm" onClick={handleMarkAllUnread} disabled={isPending}>
          Mark All Unread
        </Button>
        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
          Mark All Read
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShowAll} disabled={isPending}>
          Show All & Reset Order
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDedup} disabled={isPending}>
          Dedup
        </Button>
        <Button variant="ghost" size="sm" onClick={handleResync} disabled={isPending}>
          Resync
        </Button>
      </div>

      {/* Chapter List */}
      <div className="manga-panel overflow-hidden mt-4">
        {/* Header */}
        <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 p-3 border-b-2 border-[var(--manga-border)] bg-[var(--manga-gray)] font-bold text-sm">
          <div className="w-6">
            <input
              type="checkbox"
              checked={selectedIds.size === chapters.length && chapters.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 cursor-pointer"
            />
          </div>
          <div className="w-6"></div>
          <div>Chapter Name</div>
          <div className="w-24">Last Updated</div>
          <div className="w-20">Status</div>
          <div className="w-32">Actions</div>
        </div>

        {/* Sortable List */}
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={chapters.map((ch) => ch._id)}
            strategy={verticalListSortingStrategy}
          >
            {chapters.map((chapter) => (
              <SortableChapterRow
                key={chapter._id}
                chapter={chapter}
                isSelected={selectedIds.has(chapter._id)}
                isGhostDrag={activeDragId !== null && draggedIds.has(chapter._id) && chapter._id !== activeDragId}
                onSelect={handleSelectOne}
                onRowClick={handleRowClick}
                onMarkRead={handleMarkRead}
                onHide={handleHide}
                disabled={isPending}
              />
            ))}
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeDragId ? (
              <MultiDragOverlay
                chapterName={chapters.find((ch) => ch._id === activeDragId)?.name ?? ''}
                count={draggedIds.size}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      </div>

      {/* Loading Toast */}
      <LoadingToast
        isVisible={isPending && pendingAction !== null}
        message={pendingAction ? ACTION_MESSAGES[pendingAction] : ''}
      />
    </div>
  )
}
