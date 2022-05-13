import { moduleMetadata } from "@storybook/angular";

import { TimeFilterComponent } from "./time-filter.component";
import { GlitchtipTestingModule } from "src/app/glitchtip-testing/glitchtip-testing.module";
import { TimeFilterModule } from "./time-filter.module";

export default {
  title: "List elements/Project Filter Bar",
  decorators: [
    moduleMetadata({
      imports: [GlitchtipTestingModule, TimeFilterModule],
    }),
  ],
};

export const projectFilterBar = () => ({
  component: TimeFilterComponent,
  props: {
  },
});

projectFilterBar.story = {
  parameters: {},
};
