import { CanvasxNode } from 'src/global'

export const canvasx = (
  tagName: string,
  attributes: Record<string, string> | null,
  ...children: CanvasxNode[]
) => ({
  type: tagName,
  attributes,
  children,
})
