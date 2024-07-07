import { ref } from "@lite/lite"

import styles from "./styles.module.scss";

interface Student {
  id: number;
  name: string;
  grade: string,
  age: number;
}
let i = 0;

export default function List() {
  const list = ref<Student[]>([
    { id: i++, name: '小张', grade: '一年级', age: 8 },
    { id: i++, name: '小王', grade: '二年级', age: 9 },
    { id: i++, name: '小李', grade: '一年级', age: 8 },
  ])
  const click = () => {
    // list[0].name = 'name'
    for(let j = 0; j < 50; j++) {
      list.unshift({ id: i++, name: '小丽', grade: '一年级', age: 8 });
    }
  }
 
  return (
    <div class={styles.wrap}>
      <div>List Component</div>
      <button onClick={click}>click</button>
      <div class={styles.list}>
        {list.map((student) => (
          <div class={styles.item}>
            <div>{student.id}</div>
            <div>{student.name}</div>
            <div>{student.grade}</div>
            <div>{student.age}</div>
          </div>
        ))}
      </div>
    </div>
  )
}