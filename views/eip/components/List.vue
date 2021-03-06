<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getProjectTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import { findPlatform, typeClouds } from '@/utils/common/hypervisor'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

const noChangeBandwidth = ['azure']
export default {
  name: 'EipList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'eips',
        getParams: {
          details: true,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          ip_addr: {
            label: '地址',
            filter: true,
            formatter: val => {
              return `ip_addr.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'EipSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'ip_addr',
          title: '地址',
          width: 140,
        },
        {
          field: 'bandwidth',
          title: '带宽',
          width: 80,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        getCopyWithContentTableColumn({
          field: 'account',
          title: '云账号',
        }),
        getRegionTableColumn(),
        getBrandTableColumn(),
        {
          field: 'charge_type',
          title: '计费方式',
          width: 80,
          formatter: ({ cellValue }) => {
            if (cellValue === 'traffic') {
              return '按流量计费'
            }
            if (cellValue === 'bandwidth') {
              return '按带宽计费'
            }
            return cellValue
          },
        },
        getStatusTableColumn({ statusModule: 'eip' }),
        {
          field: 'associate_name',
          title: '绑定资源',
          width: 120,
          formatter: ({ cellValue, row }) => {
            const type = {
              server: '虚拟机',
              natgateway: 'NAT网关',
              lb: '负载均衡实例',
            }
            if (cellValue) {
              return `${cellValue}(${type[row.associate_type] || '-'})`
            }
          },
        },
        getProjectTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'eips_create',
          action: () => {
            this.createDialog('EipCreateDialog', {
              title: '新建',
              list: this.list,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          permission: 'eips_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '绑定',
          permission: 'eips_perform_associate',
          action: obj => {
            this.createDialog('EipBindServerDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            return {
              validate: !obj.associate_id && obj.status === 'ready',
            }
          },
        },
        {
          label: '解绑',
          permission: 'eips_perform_dissociate',
          action: obj => {
            this.list.singlePerformAction('dissociate', {
              id: obj.id,
            })
          },
          meta: obj => {
            if (obj.associate_id) {
              return {
                validate: true,
              }
            }
            return {
              validate: false,
            }
          },
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '修改带宽',
                permission: 'eips_perform_change_bandwidth',
                action: () => {
                  this.createDialog('EipUpdateDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  if (!obj.associate_name) {
                    return {
                      validate: false,
                      tooltip: '请您先绑定机器',
                    }
                  }
                  let { brand } = obj
                  if (brand) {
                    brand = brand.toLowerCase()
                    if (noChangeBandwidth.includes(brand)) {
                      return {
                        validate: false,
                        tooltip: `${typeClouds.getHosttype().brand.label}无法修改带宽`,
                      }
                    }
                    const plaform = findPlatform(brand)
                    if (plaform && plaform !== 'public') {
                      return {
                        validate: false,
                        tooltip: '仅公有云eip支持修改带宽',
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: '更改项目',
                permission: 'eips_perform_change_owner',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
              },
              {
                label: '删除',
                permission: 'eips_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除',
                    list: this.list,
                  })
                },
                meta: () => this.$getDeleteResult(obj),
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('eip-detail')
    this.list.fetchData()
  },
}
</script>
