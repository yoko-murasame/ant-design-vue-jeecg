<template>
  <div>
    <task-deal-modal ref="taskDealModal" :path="parent.path" :formData="parent.formData" @ok="parent.handleTaskDealOK"></task-deal-modal>
    <select-entruster-modal ref="selectEntrusterModal" @selectFinished="parent.handleEntruster"></select-entruster-modal>
    <bpm-process-track-modal ref="bpmProcessTrackModal"></bpm-process-track-modal>
  </div>
</template>

<script>
import TaskDealModal from '@views/modules/bpm/task/TaskDealModal';
import SelectEntrusterModal from '@views/modules/bpm/task/form/SelectEntrusterModal';
import BpmProcessTrackModal from '@/views/modules/bpmbiz/common/BpmProcessTrackModal'

export default {
  name: 'BindBpm',
  components: {
    TaskDealModal,
    SelectEntrusterModal,
    BpmProcessTrackModal
  },
  props: {
    parent: {
      type: Object,
      default: () => ({}),
      required: true
    }
  }
}
</script>
