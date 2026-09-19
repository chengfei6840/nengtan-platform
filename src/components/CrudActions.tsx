import { Button, Popconfirm, Space } from 'antd'

type Props = {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  viewLabel?: string
  disableDelete?: boolean
}

/** 表格行通用操作：查看 / 编辑 / 删除 */
export function CrudActions({
  onView,
  onEdit,
  onDelete,
  viewLabel = '查看',
  disableDelete,
}: Props) {
  return (
    <Space size={0} wrap>
      {onView && (
        <Button type="link" size="small" onClick={onView}>
          {viewLabel}
        </Button>
      )}
      {onEdit && (
        <Button type="link" size="small" onClick={onEdit}>
          编辑
        </Button>
      )}
      {onDelete && !disableDelete && (
        <Popconfirm title="确认删除该记录？" onConfirm={onDelete}>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      )}
    </Space>
  )
}
