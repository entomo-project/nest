import React from 'react'
import { Table, TableHead, TableHeadRow, TableHeadTh } from '@bmichalski-react/table'

export default (store, props) => {
  return (
    <Table
      location={props.location}
      store={store}>
      <TableHead>
        <TableHeadRow>
          <TableHeadTh name="status"></TableHeadTh>
          <TableHeadTh name="taskTypeId">Task type id</TableHeadTh>
          <TableHeadTh name="createdAt">Created at</TableHeadTh>
          <TableHeadTh name="startedAt">Started at</TableHeadTh>
          <TableHeadTh name="stoppedAt">Stopped at</TableHeadTh>
          <TableHeadTh name="createdBy">Created by</TableHeadTh>
          <TableHeadTh name="maxDuration">Max duration</TableHeadTh>
        </TableHeadRow>
      </TableHead>
    </Table>
  )
}