import { api } from '../services/api'
import adderSrc from '../examples/vhdl/adder.vhd?raw'
import adderTbSrc from '../examples/vhdl/adder_tb.vhd?raw'

interface ExamplePipeline {
  name: string
  description: string
  stages: {
    name: string
    tool_name: string
    image: string
    command: string
    config?: Record<string, unknown>
  }[]
}

const EXAMPLE_VHDL_COUNTER = `library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity counter is
  Port (
    clk : in STD_LOGIC;
    rst : in STD_LOGIC;
    enable : in STD_LOGIC;
    count : out unsigned(7 downto 0)
  );
end counter;

architecture Behavioral of counter is
  signal counter_val : unsigned(7 downto 0) := (others => '0');
begin
  process(clk)
  begin
    if rising_edge(clk) then
      if rst = '1' then
        counter_val <= (others => '0');
      elsif enable = '1' then
        counter_val <= counter_val + 1;
      end if;
    end if;
  end process;
  count <= counter_val;
end Behavioral;`

const EXAMPLE_VHDL_TESTBENCH = `library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity counter_tb is
end counter_tb;

architecture Behavioral of counter_tb is
  component counter is
    Port (
      clk : in STD_LOGIC;
      rst : in STD_LOGIC;
      enable : in STD_LOGIC;
      count : out unsigned(7 downto 0)
    );
  end component;

  signal clk : STD_LOGIC := '0';
  signal rst : STD_LOGIC := '0';
  signal enable : STD_LOGIC := '0';
  signal count : unsigned(7 downto 0);

  constant clk_period : time := 10 ns;
begin
  uut: counter port map (clk, rst, enable, count);

  clk_process: process
  begin
    clk <= '0';
    wait for clk_period/2;
    clk <= '1';
    wait for clk_period/2;
  end process;

  stim_proc: process
  begin
    rst <= '1';
    wait for 20 ns;
    rst <= '0';
    enable <= '1';
    wait for 200 ns;
    enable <= '0';
    wait;
  end process;
end Behavioral;`

const VHDL_SIMULATION_EXAMPLE: ExamplePipeline = {
  name: 'VHDL Counter Simulation',
  description: 'A simple 8-bit counter with GHDL simulation and GTKWave visualization',
  stages: [
    {
      name: 'Design File',
      tool_name: 'file_input',
      image: 'deda/input-handler:latest',
      command: 'copy counter.vhd /workspace',
      config: { content: EXAMPLE_VHDL_COUNTER, filename: 'counter.vhd' }
    },
    {
      name: 'Testbench',
      tool_name: 'file_input',
      image: 'deda/input-handler:latest',
      command: 'copy counter_tb.vhd /workspace',
      config: { content: EXAMPLE_VHDL_TESTBENCH, filename: 'counter_tb.vhd' }
    },
    {
      name: 'GHDL Analysis',
      tool_name: 'ghdl',
      image: 'ghdl/ghdl:llvm',
      command: 'ghdl -a counter.vhd && ghdl -a counter_tb.vhd',
    },
    {
      name: 'GHDL Elaboration',
      tool_name: 'ghdl',
      image: 'ghdl/ghdl:llvm',
      command: 'ghdl -e counter_tb',
    },
    {
      name: 'GHDL Simulation',
      tool_name: 'ghdl',
      image: 'ghdl/ghdl:llvm',
      command: 'ghdl -r counter_tb --vcd=waveform.vcd --stop-time=250ns',
    },
    {
      name: 'GTKWave View',
      tool_name: 'gtkwave',
      image: 'gtkwave/gtkwave:latest',
      command: 'gtkwave waveform.vcd',
    }
  ]
}

export async function loadExamplePipeline(): Promise<string> {
  const pipeline = await api.createPipeline({
    name: VHDL_SIMULATION_EXAMPLE.name,
    description: VHDL_SIMULATION_EXAMPLE.description
  })

  const pipelineId = pipeline.id
  const stages = VHDL_SIMULATION_EXAMPLE.stages

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    
    await api.createStage(pipelineId, {
      name: stage.name,
      tool_name: stage.tool_name,
      image: stage.image,
      command: stage.command,
      config: stage.config || {},
      order_index: i,
      position_x: 100 + i * 200,
      position_y: 100
    })
  }

  return pipelineId
}

const ADDER_EXAMPLE: ExamplePipeline = {
  name: 'VHDL Adder',
  description: '8-bit adder with GHDL simulation and GTKWave visualization',
  stages: [
    {
      name: 'Design File',
      tool_name: 'file_input',
      image: 'deda/input-handler:latest',
      command: 'copy adder.vhd /workspace',
      config: { content: adderSrc, filename: 'adder.vhd' }
    },
    {
      name: 'Testbench',
      tool_name: 'file_input',
      image: 'deda/input-handler:latest',
      command: 'copy adder_tb.vhd /workspace',
      config: { content: adderTbSrc, filename: 'adder_tb.vhd' }
    },
    {
      name: 'GHDL Analysis',
      tool_name: 'ghdl',
      image: 'ghdl/ghdl:llvm',
      command: 'ghdl -a adder.vhd && ghdl -a adder_tb.vhd',
    },
    {
      name: 'GHDL Elaboration',
      tool_name: 'ghdl',
      image: 'ghdl/ghdl:llvm',
      command: 'ghdl -e adder_tb',
    },
    {
      name: 'GHDL Simulation',
      tool_name: 'ghdl',
      image: 'ghdl/ghdl:llvm',
      command: 'ghdl -r adder_tb --vcd=waveform.vcd',
    },
    {
      name: 'GTKWave View',
      tool_name: 'gtkwave',
      image: 'gtkwave/gtkwave:latest',
      command: 'gtkwave waveform.vcd',
    }
  ]
}

export async function loadAdderExample(): Promise<string> {
  const pipeline = await api.createPipeline({
    name: ADDER_EXAMPLE.name,
    description: ADDER_EXAMPLE.description
  })

  const pipelineId = pipeline.id
  const stages = ADDER_EXAMPLE.stages

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    
    await api.createStage(pipelineId, {
      name: stage.name,
      tool_name: stage.tool_name,
      image: stage.image,
      command: stage.command,
      config: stage.config || {},
      order_index: i,
      position_x: 100 + i * 200,
      position_y: 100
    })
  }

  return pipelineId
}

export { VHDL_SIMULATION_EXAMPLE, ADDER_EXAMPLE }
