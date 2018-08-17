<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <DatePicker :value="value" :type="type" :format="format" :placeholder="holderText" style="width: 240px" @on-change="change"></DatePicker>
</template>

<script>

    export default {
        name: 'searchable-table',
        props: ['vm', 'dateName', 'holderText', 'format', 'type'],
        data () {
            return {
                value: '',
                excel_modal: false,
                okloading: true
            };
        },
        methods: {
            change (val) {
                this.value = [val[0], val[1].replace(/^(\d+-\d+-\d+)( 00| 00:00| 00:00:00)?$/, '$1 23:59:59')];
                // 专门为历史成交写的
                /*let val0 = val[0].split(' ', 2);
                 let val1 = val[1].split(' ', 2);
                 this.vm.post_data.where[this.dateName] = [val0[0], val1[0]];
                 this.vm.post_data.where[this.timeName] = [val0[1], val1[1]];*/
                console.log(this.value);
                this.vm.post_data.whereBetween[this.dateName] = this.value;
            }
        }
    };
</script>