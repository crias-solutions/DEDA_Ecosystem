library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity adder is
  Port (
    a : in unsigned(7 downto 0);
    b : in unsigned(7 downto 0);
    sum : out unsigned(7 downto 0);
    carry : out std_logic
  );
end adder;

architecture Behavioral of adder is
begin
  sum <= a + b;
  carry <= '0' when (a + b) <= X"FF" else '1';
end Behavioral;
