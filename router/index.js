import Layout from '@Compute/components/Layout'
import Network from '@Network/views/network'
import NetworkCreate from '@Network/views/network/Create'
import EditAttributes from '@Network/views/network/EditAttributes'
import Eip from '@Network/views/eip'
import FlexNetwork from '@Network/views/flex-network'
import Wire from '@Network/views/wire'

export default {
  index: 3,
  meta: {
    label: '网络',
    icon: 'menu-network',
  },
  menus: [
    {
      meta: {
        label: '基础网络',
      },
      submenus: [
        {
          path: '/wire',
          meta: {
            label: '二层网络',
            permission: 'wires_list',
          },
          component: Layout,
          children: [
            {
              name: 'WireList',
              path: '',
              component: Wire,
            },
          ],
        },
        {
          path: '/eip',
          meta: {
            label: '弹性公网IP',
            permission: 'eips_list',
          },
          component: Layout,
          children: [
            {
              name: 'Eip',
              path: '',
              component: Eip,
            },
          ],
        },
        {
          path: '/flexnetwork',
          meta: {
            label: '弹性网卡',
            permission: 'networkcard_list',
          },
          component: Layout,
          children: [
            {
              name: 'NetworkcardList',
              path: '',
              component: FlexNetwork,
            },
          ],
        },
        {
          path: '/network',
          meta: {
            label: 'IP子网',
            permission: 'networks_list',
          },
          component: Layout,
          children: [
            {
              name: 'Network',
              path: '',
              component: Network,
            },
            {
              name: 'NetworkCreate',
              path: 'create',
              component: NetworkCreate,
            },
            {
              name: 'EditAttributes',
              path: 'edit',
              component: EditAttributes,
            },
          ],
        },
      ],
    },
  ],
}
