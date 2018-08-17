<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <TimePicker type="timerange" :placeholder="holderText" style="width: 150px" @on-change="change"></TimePicker>
</template>

<script>

    export default {
        name: 'searchable-table',
        props: ['vm', 'dateName', 'holderText', 'format', 'onlyTime'],
        data () {
            return {
                excel_modal: false,
                okloading: true
            };
        },
        methods: {
            change (val) {
                if (this.onlyTime) this.vm.post_data.whereBetween[this.dateName] = val;
                else this.vm.post_data.whereBetween[this.dateName] = [this.util.dateFMT('yyyy-MM-dd') + ' ' + val[0], this.util.dateFMT('yyyy-MM-dd') + ' ' + val[1]];
            }
        }
    };
</script>