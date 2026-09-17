import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
  erro?: string | undefined;
}

export function TextField({ label, erro, ...props }: TextFieldProps) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#9ca3af"
        className={`min-h-[48px] rounded-xl border px-3 text-base text-neutral-900 dark:text-neutral-50 ${
          erro === undefined
            ? 'border-neutral-300 dark:border-neutral-700'
            : 'border-red-500 dark:border-red-400'
        }`}
        {...props}
      />
      {erro === undefined ? null : (
        <Text className="text-sm text-red-600 dark:text-red-400">{erro}</Text>
      )}
    </View>
  );
}
