<style lang="less">
  @import '../../styles/common.less';
</style>

<template>
  <div>
    <Row :gutter="10">
      <Col span="24">
      <Card>
        <p slot="title">
          <Icon type="help-buoy"></Icon>
          统计信息：......
        </p>
        <Row>
          <Col span="12" :style="{textAlign:'left'}">
            <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='holiday' holderText="节假日时间筛选"></dateRange>
          </Col>
          <Col span="12" :style="{textAlign:'right'}">
          <Input v-model="post_data.search.remark" clearable placeholder="备注" style="width: 120px"/>
          <Button type="primary" shape="circle" icon="ios-search" @click="pageChange(1)"></Button>
          <excel :vm="vm"></excel>
          </Col>
        </Row>
        <Row class="margin-top-10">
          <Table border :columns="columns" :data="data" :loading="loading" ref="table"></Table>
        </Row>
        <Row class="margin-top-10">
          <Page show-elevator show-sizer show-total size="small"
                @on-change="pageChange"
                @on-page-size-change="pageSizeChange"
                :current="currentPage"
                :total="total">
          </Page>
        </Row>
      </Card>
      </Col>
    </Row>
  </div>
</template>

<script>

    import excel from '../common/excel';
    import dateRange from '../common/dateRange.vue';
    export default {
        name: 'searchable-table',
        components: {excel, dateRange},
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                columns: [
                    {
                        title: '年份',
                        key: 'year'
                    },
                    {
                        title: '节假日时间',
                        key: 'holiday'
                    },
                    {
                        title: '备注',
                        key: 'remark'
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*'],
                    search: {
                        remark: ''
                    },
                    whereBetween: {
                        holiday: []
                    },
                    count: true,
                    offset: 0,
                    limit: 10,
                    order: 'id desc'
                }
            };
        },
        methods: {
            init () {
                this.getList(this.post_data).then(res => {
                    this.total = res.count;
                    this.data = res.list;
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/holidayList', params).then(res => {
                    return res.data;
                });
            },
            pageChange (value) {
                this.currentPage = value;
                this.post_data.offset = (value - 1) * this.post_data.limit;
                this.init();
            },
            pageSizeChange (value) {
                this.currentPage = 1;
                this.post_data.limit = value;
                this.init();
            }
        },
        activated () {
            this.init();
        }
    };
</script>
