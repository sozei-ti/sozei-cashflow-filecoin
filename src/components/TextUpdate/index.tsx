import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import styles from './styles.module.scss'

export function TextUpdaterNode({ data }: any) {
  const onChange = useCallback((evt: { target: { value: any; }; }) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className={styles.textUpdaterNode}>
      <div><strong>{data.label}</strong></div>
      <Handle type="source" position={Position.Right} id="a" />
      <Handle type="target" position={Position.Left} id="b" />
    </div>
  )
}