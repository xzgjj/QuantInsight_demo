type TaskStepChipsProps = {
  steps: string[];
};

export function TaskStepChips({ steps }: TaskStepChipsProps) {
  return (
    <p className="mt-4 text-xs leading-5 text-graphite">流程：{steps.join(" / ")}</p>
  );
}
