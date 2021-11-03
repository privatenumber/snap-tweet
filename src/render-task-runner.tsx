// eslint-disable-line unicorn/filename-case
import React, { ComponentProps, useReducer, FC } from 'react';
import { render } from 'ink';
import { TaskList, Task } from 'ink-task-list';

interface Task {
	label: string;
	state: ComponentProps<typeof Task>['state'];
}

const CliSnapTweet: FC<{
	items: Task[];
}> = ({ items }) => (
	<TaskList>
		{
			items.map((item, index) => (
				<Task
					key={index}
					label={item.label}
					state={item.state}
				/>
			))
		}
	</TaskList>
);

const reducer = (state: Task[], task: 'task-updated' | Task) => {
	if (task === 'task-updated') {
		return state.slice();
	}
	return [...state, task];
};

function renderTaskRunner() {
	let items;
	let dispatchAction;
	render(React.createElement(() => {
		[items, dispatchAction] = useReducer(reducer, []);
		return React.createElement(CliSnapTweet, { items });
	}));

	return function addTask(label: string) {
		const task = {
			label,
			state: 'loading',
		};
		dispatchAction(task);

		return {
			success(message) {
				task.label = message;
				task.state = 'success';

				dispatchAction('task-updated');
			},
			error(message) {
				task.label = message;
				task.state = 'error';

				dispatchAction('task-updated');
			},
		};
	};
}

export default renderTaskRunner;
