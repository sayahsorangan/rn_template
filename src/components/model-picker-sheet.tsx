import React, {useCallback, useEffect, useState} from 'react';

import {ActivityIndicator, Alert, Dimensions, FlatList, ScrollView, TouchableOpacity} from 'react-native';

import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {Modal} from '@components/modal';
import {MODEL_CATALOG, ModelEntry} from '@lib/llm/catalog';
import {cancelDownload, deleteModel, getModelFilePath, scanLocalModels, startDownload} from '@lib/llm/downloader';
import {DEFAULT_EMBED_MODEL} from '@lib/rag/catalog';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectModel: (path: string) => void;
}

interface LocalFile {
  name: string;
  path: string;
  size: number;
}

type Tab = 'local' | 'download';

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + ' GB';
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

export const ModelPickerSheet: React.FC<Props> = ({visible, onClose, onSelectModel}) => {
  const dispatch = useAppDispatch();
  const downloads = useAppSelector(state => state.LlmReducer.downloads);
  const currentModelPath = useAppSelector(state => state.LlmReducer.modelPath);

  const [activeTab, setActiveTab] = useState<Tab>('download');
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [scanning, setScanning] = useState(false);

  const refreshLocal = useCallback(async () => {
    setScanning(true);
    const found = await scanLocalModels();
    // Exclude the embedding model — it's internal and not a chat model
    setLocalFiles(found.filter(f => f.name !== DEFAULT_EMBED_MODEL.filename));
    setScanning(false);
  }, []);

  useEffect(() => {
    if (visible) {
      refreshLocal();
    }
  }, [visible, refreshLocal]);

  const handleDownload = useCallback(
    (model: ModelEntry) => {
      startDownload(model, dispatch).then(() => refreshLocal());
    },
    [dispatch, refreshLocal],
  );

  const handleCancel = useCallback(
    (modelId: string) => {
      cancelDownload(modelId, dispatch);
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (model: ModelEntry) => {
      Alert.alert('Delete Model', `Delete "${model.name}"? It will need to be re-downloaded.`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteModel(model.id, model.filename, dispatch);
            refreshLocal();
          },
        },
      ]);
    },
    [dispatch, refreshLocal],
  );

  const handleSelectFromCatalog = useCallback(
    (model: ModelEntry) => {
      const dl = downloads[model.id];
      if (dl?.status === 'done' && dl.filePath) {
        onSelectModel(dl.filePath);
      } else {
        const path = getModelFilePath(model.filename);
        onSelectModel(path);
      }
    },
    [downloads, onSelectModel],
  );

  return (
    <Modal
      show={visible}
      onDissmiss={onClose}
      animationType="slide"
      style={{justifyContent: 'flex-end', alignItems: 'stretch'}}
    >
      <Box
        backgroundColor="white"
        borderTopLeftRadius="xl"
        borderTopRightRadius="xl"
        style={{height: SCREEN_HEIGHT * 0.82}}
      >
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="md"
          paddingVertical="md"
        >
          <Text variant="h_4_bold">Model Manager</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text variant="body_regular" color="primary">
              Done
            </Text>
          </TouchableOpacity>
        </Box>

        {/* Tabs */}
        <Box
          flexDirection="row"
          marginHorizontal="md"
          height={40}
          marginBottom={'md'}
          borderRadius="sm"
          backgroundColor="grey_light"
          padding="xxs"
        >
          {(['download', 'local'] as Tab[]).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={{flex: 1}}>
              <Box
                flex={1}
                borderRadius="xs"
                alignItems="center"
                backgroundColor={activeTab === tab ? 'white' : undefined}
                justifyContent={'center'}
              >
                <Text variant="body_helper_semibold" color={activeTab === tab ? 'black' : 'grey'}>
                  {tab === 'download' ? 'Download' : 'My Models'}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </Box>

        {/* Tab content */}
        {activeTab === 'download' ? (
          <DownloadTab
            downloads={downloads}
            currentModelPath={currentModelPath}
            onDownload={handleDownload}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onSelect={handleSelectFromCatalog}
          />
        ) : (
          <LocalTab
            files={localFiles}
            scanning={scanning}
            currentModelPath={currentModelPath}
            onRefresh={refreshLocal}
            onSelect={path => onSelectModel(path)}
          />
        )}
      </Box>
    </Modal>
  );
};

/* ─── Download Tab ─────────────────────────────────────────── */
interface DownloadTabProps {
  downloads: Record<string, any>;
  currentModelPath: string | null;
  onDownload: (m: ModelEntry) => void;
  onCancel: (id: string) => void;
  onDelete: (m: ModelEntry) => void;
  onSelect: (m: ModelEntry) => void;
}

const DownloadTab: React.FC<DownloadTabProps> = ({
  downloads,
  currentModelPath,
  onDownload,
  onCancel,
  onDelete,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{padding: theme.spacing.md, paddingBottom: theme.spacing.xl}}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="body_helper_regular" color="grey" marginBottom="md">
        Download a model directly to your device. Models run fully offline.
      </Text>
      {MODEL_CATALOG.map(model => {
        const dl = downloads[model.id];
        const status = dl?.status ?? 'idle';
        const progress = dl?.progress ?? 0;
        const filePath = dl?.filePath;
        const isActive = filePath === currentModelPath;
        const isDone = status === 'done';
        const isDownloading = status === 'downloading';
        const isError = status === 'error';

        return (
          <Box
            key={model.id}
            borderRadius="md"
            borderWidth={1}
            style={{
              borderColor: isActive ? theme.colors.primary : theme.colors.grey_light,
            }}
            padding="md"
            marginBottom="md"
            backgroundColor={isActive ? 'primary_light' : 'white'}
          >
            {/* Title row */}
            <Box flexDirection="row" alignItems="center" marginBottom="xxs">
              <Text variant="body_semibold" flex={1}>
                {model.name}
              </Text>
              {model.recommended ? (
                <Box backgroundColor="primary" borderRadius="xs" paddingHorizontal="xs" paddingVertical="xxs">
                  <Text variant="body_helper_regular" color="white">
                    Recommended
                  </Text>
                </Box>
              ) : null}
            </Box>

            {/* Meta */}
            <Box flexDirection="row" marginBottom="xs" gap="xs">
              <Box backgroundColor="grey_light" borderRadius="xxs" paddingHorizontal="xs" paddingVertical="xxs">
                <Text variant="body_helper_regular" color="grey_dark">
                  {model.parameters}
                </Text>
              </Box>
              <Box backgroundColor="grey_light" borderRadius="xxs" paddingHorizontal="xs" paddingVertical="xxs">
                <Text variant="body_helper_regular" color="grey_dark">
                  {model.quantization}
                </Text>
              </Box>
              <Box backgroundColor="grey_light" borderRadius="xxs" paddingHorizontal="xs" paddingVertical="xxs">
                <Text variant="body_helper_regular" color="grey_dark">
                  {model.sizeLabel}
                </Text>
              </Box>
            </Box>

            <Text variant="body_helper_regular" color="grey" marginBottom="sm">
              {model.description}
            </Text>

            {/* Progress bar */}
            {isDownloading ? (
              <Box marginBottom="sm">
                <Box height={6} borderRadius="round" backgroundColor="grey_light" overflow="hidden" marginBottom="xxs">
                  <Box height={6} borderRadius="round" backgroundColor="primary" style={{width: `${progress}%`}} />
                </Box>
                <Text variant="body_helper_regular" color="grey">
                  Downloading… {progress}%
                </Text>
              </Box>
            ) : null}

            {isError ? (
              <Text variant="body_helper_regular" color="danger" marginBottom="xs">
                Error: {dl?.error}
              </Text>
            ) : null}

            {/* Action buttons */}
            <Box flexDirection="row" gap="xs">
              {isDone ? (
                <>
                  <TouchableOpacity onPress={() => onSelect(model)} style={{flex: 1}}>
                    <Box
                      borderRadius="sm"
                      paddingVertical="xs"
                      alignItems="center"
                      backgroundColor={isActive ? 'primary' : 'primary_light'}
                    >
                      <Text variant="body_helper_semibold" color={isActive ? 'white' : 'primary'}>
                        {isActive ? '✓ Active' : 'Use Model'}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(model)}>
                    <Box
                      borderRadius="sm"
                      paddingVertical="xs"
                      paddingHorizontal="md"
                      alignItems="center"
                      style={{borderWidth: 1, borderColor: theme.colors.danger}}
                    >
                      <Text variant="body_helper_semibold" color="danger">
                        Delete
                      </Text>
                    </Box>
                  </TouchableOpacity>
                </>
              ) : isDownloading ? (
                <TouchableOpacity onPress={() => onCancel(model.id)} style={{flex: 1}}>
                  <Box
                    borderRadius="sm"
                    paddingVertical="xs"
                    alignItems="center"
                    style={{borderWidth: 1, borderColor: theme.colors.danger}}
                  >
                    <Text variant="body_helper_semibold" color="danger">
                      Cancel
                    </Text>
                  </Box>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => onDownload(model)} style={{flex: 1}}>
                  <Box borderRadius="sm" paddingVertical="xs" alignItems="center" backgroundColor="primary">
                    <Text variant="body_helper_semibold" color="white">
                      {isError ? 'Retry Download' : 'Download'}
                    </Text>
                  </Box>
                </TouchableOpacity>
              )}
            </Box>
          </Box>
        );
      })}
    </ScrollView>
  );
};

/* ─── Local Tab ────────────────────────────────────────────── */
interface LocalTabProps {
  files: LocalFile[];
  scanning: boolean;
  currentModelPath: string | null;
  onRefresh: () => void;
  onSelect: (path: string) => void;
}

const LocalTab: React.FC<LocalTabProps> = ({files, scanning, currentModelPath, onRefresh, onSelect}) => {
  const theme = useTheme();

  if (scanning) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator color={theme.colors.primary} />
        <Text variant="body_helper_regular" color="grey" marginTop="xs">
          Scanning…
        </Text>
      </Box>
    );
  }

  return (
    <FlatList
      data={files}
      keyExtractor={item => item.path}
      contentContainerStyle={{
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
        flexGrow: 1,
      }}
      ListHeaderComponent={
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="md">
          <Text variant="body_helper_regular" color="grey">
            GGUF models in Documents folder
          </Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text variant="body_helper_semibold" color="primary">
              Refresh
            </Text>
          </TouchableOpacity>
        </Box>
      }
      ListEmptyComponent={
        <Box flex={1} alignItems="center" justifyContent="center" paddingTop="xxl">
          <Text variant="body_regular" color="grey" textAlign="center">
            No models found.{'\n'}Download a model from the Download tab,{'\n'}or copy a .gguf file via Finder.
          </Text>
        </Box>
      }
      renderItem={({item}) => {
        const isActive = item.path === currentModelPath;
        return (
          <TouchableOpacity onPress={() => onSelect(item.path)}>
            <Box
              flexDirection="row"
              alignItems="center"
              padding="md"
              borderRadius="md"
              marginBottom="sm"
              borderWidth={1}
              style={{borderColor: isActive ? theme.colors.primary : theme.colors.grey_light}}
              backgroundColor={isActive ? 'primary_light' : 'white'}
            >
              <Box flex={1} marginRight="sm">
                <Text variant="body_semibold" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text variant="body_helper_regular" color="grey">
                  {formatBytes(item.size)}
                </Text>
              </Box>
              {isActive ? (
                <Box backgroundColor="primary" borderRadius="xs" paddingHorizontal="xs" paddingVertical="xxs">
                  <Text variant="body_helper_regular" color="white">
                    Active
                  </Text>
                </Box>
              ) : null}
            </Box>
          </TouchableOpacity>
        );
      }}
    />
  );
};
