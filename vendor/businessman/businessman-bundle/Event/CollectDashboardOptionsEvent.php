<?php
namespace BusinessMan\Bundle\BusinessManBundle\Event;

use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\EventDispatcher\Event;
use BusinessMan\Bundle\BusinessManBundle\Dashboard\DashboardOption;

/**
 * Event fired when the app dashboard options are being collected
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CommonBundle
 */
class CollectDashboardOptionsEvent extends Event
{
    /**
     * @var ArrayCollection
     */
    protected $options;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->options = new ArrayCollection();
    }

    /**
     * @return ArrayCollection
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * @param string $controller
     * @param string $label
     * @param string $color
     * @param string $icon
     * @param int    $minWidth
     * @param int    $minHeight
     * @param int    $maxWidth
     * @param int    $maxHeight
     *
     * @return DashboardOption
     */
    public function addWidget(
        $controller,
        $label,
        $color = null,
        $icon = null,
        $minWidth = 6,
        $minHeight = 3,
        $maxWidth = 6,
        $maxHeight = 3
    ) {
        $option = new DashboardOption(
            $controller,
            $label,
            DashboardOption::TYPE_WIDGET,
            $color,
            $icon,
            $minWidth,
            $minHeight,
            $maxWidth,
            $maxHeight
        );

        $this->options->add($option);

        return $option;
    }

    /**
     * @param string $controller
     * @param string $label
     * @param string $color
     * @param string $icon
     *
     * @return DashboardOption
     */
    public function addSummary($controller, $label, $color = null, $icon = null, $linkedWidget = null)
    {
        $option = new DashboardOption(
            $controller,
            $label,
            DashboardOption::TYPE_SUMMARY,
            $color,
            $icon
        );

        $this->options->add($option);

        return $option;
    }
}
