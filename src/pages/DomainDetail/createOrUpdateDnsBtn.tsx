import { useRequest } from 'ahooks';
import { Button, message } from 'antd';
import form from 'antd/es/form';
import { useContext } from 'react';
import React from 'react';

import * as Api from '@/api';
import { catchCommonResponseError, MessageError, useError } from '@/error';

import { RowFormContext } from './context';
import { DnsItem } from './type';

const CreateOrUpdateDnsButton: React.FC<{
  item: DnsItem;
  onUpdated: (item: DnsItem, newData: Api.Domain.DomainDNSItem) => void;
  onCreated: (item: DnsItem, newData: Api.Domain.DomainDNSItem) => void;
}> = ({ item, onUpdated, onCreated }) => {
  const form = useContext(RowFormContext);

  const {
    run: doDnsUpdate,
    loading: loadingDnsUpdate,
    error: errorOnDnsUpdate,
  } = useRequest(
    async () => {
      if (!form) throw new MessageError('error', '表单未初始化(#91)');
      const data = await form.validateFields().catch(() => null);
      if (!data) return;
      const fullData = {
        ...data,
        id: item.id,
        custom: item.custom,
        comment: item.comment,
      } satisfies Api.Domain.DomainDNSItem;
      const res = await catchCommonResponseError(
        Api.Domain.dnsUpdate(item.domainId, item.id, fullData),
      );
      if (res.data.status !== 200) {
        throw new MessageError('error', res.data.errors || '未知错误(#89)');
      }
      message.success('更新成功');
      onUpdated(item, res.data.data);
    },
    {
      manual: true,
    },
  );
  useError(errorOnDnsUpdate);

  const {
    run: doCreateDns,
    loading: loadingCreateDns,
    error: errorOnCreateDns,
  } = useRequest(
    async () => {
      if (!form) throw new MessageError('error', '表单未初始化(#92)');
      const data = await form.validateFields().catch(() => null);
      if (!data) return;
      const fullData = {
        ...data,
        custom: item.custom,
        comment: item.comment,
      } satisfies Omit<Api.Domain.DomainDNSItem, 'id'>;

      const res = await catchCommonResponseError(
        Api.Domain.dnsCreate(item.domainId, fullData),
      );
      if (res.data.status !== 201) {
        throw new MessageError('error', res.data.errors || '未知错误(#88)');
      }
      message.success('创建成功');
      onCreated(item, res.data.data);
    },
    {
      manual: true,
    },
  );
  useError(errorOnCreateDns);

  return (
    <Button
      type="primary"
      loading={loadingDnsUpdate || loadingCreateDns}
      onClick={item.new ? doCreateDns : doDnsUpdate}>
      保存
    </Button>
  );
};

export default CreateOrUpdateDnsButton;
