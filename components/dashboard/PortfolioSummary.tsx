import React, { FunctionComponent, useMemo } from "react";
import { TEXT_TYPE } from "@constants/typography";
import Typography from "@components/UI/typography/typography";
import { Doughnut } from "react-chartjs-2";
import styles from "@styles/dashboard.module.css";
import { Chart, ArcElement, DoughnutController, Tooltip, ChartEvent, ActiveElement, TooltipItem, ChartOptions } from 'chart.js';
import { CDNImg } from "@components/cdn/image";
import starknetIcon from "../../public/starknet/favicon.ico";
import cursor from '../../public/icons/cursor.png';
import cursorPointer from '../../public/icons/pointer-cursor.png';

Chart.register(ArcElement, DoughnutController, Tooltip);

type PortfolioSummaryProps = {
  title: string,
  data: ChartItem[],
  totalBalance: number,
  isProtocol: boolean,
  isLoading: boolean
}

const ChartItem: FunctionComponent<ChartItem> = ({
  color,
  itemLabel,
  itemValue,
  itemValueSymbol
}) => {
  const value = itemValueSymbol === '%' ? itemValue + itemValueSymbol : itemValueSymbol + itemValue;
  return (
    <div className="flex w-full justify-between my-1">
      <div className="flex flex-row w-full items-center gap-2">
        <svg width={16} height={16}>
          <circle cx="50%" cy="50%" r="8" fill={color} />
        </svg>
        <Typography type={TEXT_TYPE.BODY_MIDDLE}>{itemLabel}</Typography>
      </div>
      <Typography type={TEXT_TYPE.BODY_MIDDLE}>{value}</Typography>
    </div>
  );
};

const PortfolioSummary: FunctionComponent<PortfolioSummaryProps> = ({ title, data, totalBalance, isProtocol }) => {
  const normalizeMinValue = (data: ChartItem[], minPercentage: number) => {
    return data.map(entry => 
      Number(entry.itemValue) < totalBalance * minPercentage ? 
      (totalBalance * minPercentage).toFixed(2) : 
      entry.itemValue
    );
  }

  const chartOptions: ChartOptions<"doughnut"> = useMemo(() => ({
    elements: {
      arc: {
        borderRadius: 3,
        spacing: 1,
        hoverBorderColor: "white",
        hoverBorderWidth: 1,
        hoverOffset: 2
      }
    },
    layout: {
      padding: 5
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"doughnut">) {
            return ` ${data[tooltipItem.dataIndex].itemValueSymbol}${data[tooltipItem.dataIndex].itemValue}`;
          }
        }
      }
    },
    onHover: (event: ChartEvent, element: ActiveElement[]) => {
      let canvas = event.native?.target as HTMLCanvasElement;
      canvas.style.cursor = element[0] ? `url(${cursorPointer.src}), pointer` : `url(${cursor.src}), auto`;
    }
  }), [data]);

  return data.length > 0 ? (
    <div className={styles.dashboard_portfolio_summary}>
      <div className="flex flex-col md:flex-row w-full justify-between items-center mb-4">
        <div className="mb-4 md:mb-1">
          <Typography type={TEXT_TYPE.BUTTON_LARGE} style={{ textAlign: "left", width: "fit-content"}}>{title}</Typography>
        </div>
        {isProtocol && (
          <button
            onClick={() => { }}
            className="flex items-center justify-evenly gap-1.5 lg:gap-4 bg-white rounded-xl modified-cursor-pointer h-min px-6 py-2 mb-4 md:mb-0"
          >
            <CDNImg width={20} src={starknetIcon.src} loading="lazy" />
            <Typography type={TEXT_TYPE.BUTTON_SMALL} color="background" style={{ lineHeight: "1rem" }}>
              Claim your reward
            </Typography>
          </button>
        )}
      </div>
      <div className={styles.dashboard_portfolio_summary_info}>
        <div className="flex flex-col justify-between w-10/12 md:w-8/12 h-fit">
          {data.map((item, id) => (
            <ChartItem key={id} {...item} />
          ))}
        </div>
        <div className="w-full mb-4 md:w-3/12 md:mb-0">
          <Doughnut
            data={{
              labels: data.map(entry => entry.itemLabel),
              datasets: [{
                label: '',
                data: normalizeMinValue(data, .05),
                backgroundColor: data.map(entry => entry.color),
                borderColor: data.map(entry => entry.color),
                borderWidth: 1,
              }],
            }}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  ) : null;
}

export default PortfolioSummary;