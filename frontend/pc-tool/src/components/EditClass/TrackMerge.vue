<template>
    <div class="track-merge-container">
        <div class="sub-header">{{ $$('track-operations') }}</div>
        <div class="track-info">
            <div class="track-item">
                <span class="label">{{ $$('track-id') }}:</span>
                <span class="value" :title="state.trackId">{{ state.trackId }}</span>
            </div>
            <div class="track-item">
                <span class="label">{{ $$('track-name') }}:</span>
                <span class="value">{{ state.trackName }}</span>
            </div>
        </div>
        <div class="merge-section">
            <a-button
                size="small"
                block
                @click="onMergeTrack"
                :disabled="!canMerge()"
                :title="$$('merge-track-tooltip')"
            >
                <template #icon>
                    <MergeCellsOutlined />
                </template>
                {{ $$('merge-track') }}
            </a-button>
            <div class="help-text">{{ $$('merge-help-text') }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { MergeCellsOutlined } from '@ant-design/icons-vue';
    import { IState } from './type';
    import { useInjectEditor } from '../../state';
    import * as locale from './lang';
    import useUI from '../../hook/useUI';

    interface IProps {
        state: IState;
    }

    // Props
    let props = defineProps<IProps>();

    let editor = useInjectEditor();
    let $$ = editor.bindLocale(locale);
    let { canEdit } = useUI();

    function canMerge() {
        // Can only merge if in edit mode and have a valid trackId
        return canEdit() && props.state.trackId && !props.state.isBatch;
    }

    async function onMergeTrack() {
        if (!canMerge()) return;

        try {
            // Show instruction to user
            editor.showMsg('info', $$('pick-target-track'));

            // Let user pick the target track by clicking on an object
            const targetObject = await editor.actionManager.execute('pickObject');

            if (!targetObject) {
                // User canceled
                return;
            }

            const targetTrackId = targetObject.userData.trackId;
            const targetTrackName = targetObject.userData.trackName;
            const currentTrackId = props.state.trackId;
            const currentTrackName = props.state.trackName;

            // Validate not merging with itself
            if (targetTrackId === currentTrackId) {
                editor.showMsg('warning', $$('same-track-error'));
                return;
            }

            // Validate merge is possible
            const canMergeResult = editor.trackManager.canMerge(currentTrackId, targetTrackId);

            if (canMergeResult.code !== 'ok') {
                // Show specific error message based on code
                if (canMergeResult.code === 'classType_diff') {
                    editor.showMsg('error', $$('class-type-mismatch'));
                } else if (canMergeResult.code === 'object_repeat') {
                    editor.showMsg(
                        'error',
                        $$('frame-overlap-error', {
                            frames: canMergeResult.data.join(', '),
                        }),
                    );
                } else {
                    editor.showMsg('error', $$('merge-validation-failed'));
                }
                return;
            }

            // Confirm merge with user
            const confirmed = await editor.showConfirm({
                title: $$('confirm-merge'),
                subTitle: $$('merge-subtitle', {
                    from: currentTrackName || currentTrackId,
                    to: targetTrackName || targetTrackId,
                }),
                okText: $$('confirm'),
                cancelText: $$('cancel'),
                okDanger: false,
            });

            if (!confirmed) return;

            // Execute merge
            editor.trackManager.mergeTrackObject(currentTrackId, targetTrackId);

            // Show success message
            editor.showMsg('success', $$('merge-success'));

            // Refresh UI
            editor.dispatchEvent({ type: 'UPDATE_TIME_LINE' });
        } catch (error) {
            console.error('Track merge error:', error);
            editor.showMsg('error', $$('merge-error'));
        }
    }
</script>

<style lang="less" scoped>
    .track-merge-container {
        padding: 12px 0;
    }

    .track-info {
        margin: 8px 0 16px 0;
        padding: 8px;
        background: #2a2a2e;
        border-radius: 4px;
    }

    .track-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        &:last-child {
            margin-bottom: 0;
        }

        .label {
            font-size: 12px;
            color: #999;
        }

        .value {
            font-size: 12px;
            color: #d5d5d5;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .merge-section {
        margin-top: 12px;

        .ant-btn {
            height: 32px;
            font-size: 13px;
            border-color: #4a90e2;
            color: #4a90e2;

            &:hover:not(:disabled) {
                border-color: #5ba3ff;
                color: #5ba3ff;
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }

        .help-text {
            margin-top: 8px;
            font-size: 11px;
            color: #888;
            line-height: 1.4;
        }
    }
</style>
