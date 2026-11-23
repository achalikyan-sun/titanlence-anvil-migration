import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  Flex,
  SearchField,
  SegmentedControl,
  SelectFieldSync,
  Spinner,
  Text,
  TextField,
  toast,
} from "@servicetitan/anvil2";
import { METRICS } from "../data/mock";

const CAP = 10; // S1-13: selection limit

export function AddToWatchlistDialog(props: {
  open: boolean;
  selected: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(props.selected);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // S1-12: brief loading state when the dialog opens
  useEffect(() => {
    if (!props.open) return;
    setPicked(props.selected);
    setQ("");
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [props.open, props.selected]);

  const list = useMemo(() => METRICS.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())), [q]);
  const atCap = picked.length >= CAP;

  return (
    <Dialog open={props.open} onClose={props.onClose} size="large">
      <Dialog.Header>Your watchlist</Dialog.Header>
      <Dialog.Content>
        <Flex direction="column" gap="3">
          <SearchField aria-label="Search metrics" placeholder="Search metrics" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} />
          <Text>
            {picked.length} of {CAP} selected
          </Text>
          {loading ? (
            <Flex justifyContent="center">
              <Spinner />
            </Flex>
          ) : list.length === 0 ? (
            <Text>No metrics match.</Text>
          ) : (
            list.map((m) => {
              const checked = picked.includes(m.id);
              return (
                <Flex key={m.id} alignItems="center" justifyContent="space-between" gap="3">
                  <Checkbox
                    label={m.name}
                    checked={checked}
                    disabled={!checked && atCap}
                    onChange={() => setPicked((p) => (checked ? p.filter((x) => x !== m.id) : [...p, m.id]))}
                  />
                  <Flex gap="2">
                    {m.certified && <Chip size="small" label="Certified" />}
                    <Chip size="small" label={m.category} />
                  </Flex>
                </Flex>
              );
            })
          )}
        </Flex>
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.CancelButton>Cancel</Dialog.CancelButton>
        <Button appearance="primary" onClick={() => props.onSave(picked)}>
          Save
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

type ActionProps = { open: boolean; name?: string; onClose: () => void };

export function ShareDialog({ open, name, onClose }: ActionProps) {
  const [who, setWho] = useState("");
  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Header>Share “{name}”</Dialog.Header>
      <Dialog.Content>
        <TextField label="Enter user name or group name" value={who} onChange={(e) => setWho(e.target.value)} />
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.CancelButton>Cancel</Dialog.CancelButton>
        <Button
          appearance="primary"
          disabled={!who.trim()}
          onClick={() => {
            toast.success({ title: "Shared", message: `${name} was shared with ${who}.` });
            setWho("");
            onClose();
          }}
        >
          Share
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

const FREQ = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function ScheduleDialog({ open, name, onClose }: ActionProps) {
  const [title, setTitle] = useState("");
  const [freq, setFreq] = useState("week");
  useEffect(() => {
    if (open) setTitle(name ?? "");
  }, [open, name]);
  return (
    <Dialog open={open} onClose={onClose} size="large">
      <Dialog.Header>Create schedule</Dialog.Header>
      <Dialog.Content>
        <Flex direction="column" gap="4">
          <TextField label="Schedule name" value={title} onChange={(e) => setTitle(e.target.value)} />
          <SelectFieldSync
            label="Send every"
            options={FREQ}
            value={FREQ.find((f) => f.id === freq) ?? null}
            onSelectedOptionChange={(o) => o && setFreq(String(o.id))}
          />
        </Flex>
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.CancelButton>Cancel</Dialog.CancelButton>
        <Button
          appearance="primary"
          onClick={() => {
            toast.success({ title: "Schedule created", message: `${title} will be sent every ${freq}.` });
            onClose();
          }}
        >
          Create
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export function ExportDialog({ open, name, onClose }: ActionProps) {
  const [format, setFormat] = useState("pdf");
  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Header>Export “{name}”</Dialog.Header>
      <Dialog.Content>
        <Flex direction="column" gap="3">
          <Text>
            {format === "pdf"
              ? "A visual copy of the whole dashboard, laid out like it appears on screen."
              : "A single image of the whole dashboard."}
          </Text>
          <SegmentedControl selected={format} onChange={setFormat} name="export-format">
            <SegmentedControl.Segment value="pdf">PDF</SegmentedControl.Segment>
            <SegmentedControl.Segment value="png">PNG</SegmentedControl.Segment>
          </SegmentedControl>
        </Flex>
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.CancelButton>Cancel</Dialog.CancelButton>
        <Button
          appearance="primary"
          onClick={() => {
            toast.info({ title: "Export started", message: `Preparing ${format.toUpperCase()} of ${name}.` });
            onClose();
          }}
        >
          Download
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
