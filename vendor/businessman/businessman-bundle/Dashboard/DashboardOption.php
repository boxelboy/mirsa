<?php
namespace BusinessMan\Bundle\BusinessManBundle\Dashboard;

/**
 * DashboardOption
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/BusinessManBundle
 */
class DashboardOption
{
    const TYPE_SUMMARY = 'summary';
    const TYPE_WIDGET = 'widget';

    /**
     * @var string
     */
    protected $controller;

    /**
     * @var string
     */
    protected $color;

    /**
     * @var string
     */
    protected $icon;

    /**
     * @var string
     */
    protected $label;

    /**
     * @var string
     */
    protected $type;

    /**
     * @var int
     */
    protected $minWidth;

    /**
     * @var int
     */
    protected $minHeight;

    /**
     * @var int
     */
    protected $maxWidth;

    /**
     * @var int
     */
    protected $maxHeight;

    /**
     * @var DashboardOption
     */
    protected $linkedOption;

    /**
     * @var string
     */
    protected $route;

    /**
     * @var boolean
     */
    protected $dynamicWindow;

    /**
     * @param string $controller
     * @param string $label
     * @param string $type
     * @param string $color
     * @param string $icon
     * @param int    $minWidth
     * @param int    $minHeight
     * @param int    $maxWidth
     * @param int    $maxHeight
     */
    public function __construct(
        $controller,
        $label,
        $type = self::TYPE_SUMMARY,
        $color = null,
        $icon = null,
        $minWidth = 2,
        $minHeight = 2,
        $maxWidth = 4,
        $maxHeight = 2
    ) {
        $this->controller = $controller;
        $this->label = $label;
        $this->type = $type;
        $this->minWidth = $minWidth;
        $this->minHeight = $minHeight;
        $this->maxWidth = $maxWidth;
        $this->maxHeight = $maxHeight;
        $this->color = $color;
        $this->icon = $icon;
        $this->dynamicWindow = false;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @return int
     */
    public function getMaxHeight()
    {
        return $this->maxHeight;
    }

    /**
     * @return int
     */
    public function getMaxWidth()
    {
        return $this->maxWidth;
    }

    /**
     * @return int
     */
    public function getMinHeight()
    {
        return $this->minHeight;
    }

    /**
     * @return int
     */
    public function getMinWidth()
    {
        return $this->minWidth;
    }

    /**
     * @return string
     */
    public function getController()
    {
        return $this->controller;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return string
     */
    public function getName()
    {
        if ($this->dynamicWindow) {
            return 'dynamic_window';
        }

        return strtolower(str_replace(':', '_', $this->controller));
    }

    /**
     * @return string
     */
    public function getColor()
    {
        return $this->color;
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return $this->icon;
    }

    /**
     * @return DashboardOption
     */
    public function getLinkedOption()
    {
        return $this->linkedOption;
    }

    /**
     * @return boolean
     */
    public function getDynamicWindow()
    {
        return $this->dynamicWindow;
    }

    /**
     * @return string
     */
    public function getRoute()
    {
        return $this->route;
    }

    /**
     * @param string $color
     */
    public function setColor($color)
    {
        $this->color = $color;
    }

    /**
     * @param string $controller
     */
    public function setController($controller)
    {
        $this->controller = $controller;
    }

    /**
     * @param string $icon
     */
    public function setIcon($icon)
    {
        $this->icon = $icon;
    }

    /**
     * @param string $label
     */
    public function setLabel($label)
    {
        $this->label = $label;
    }

    /**
     * @param \BusinessMan\Bundle\BusinessManBundle\Dashboard\DashboardOption $linkedOption
     */
    public function setLinkedOption($linkedOption)
    {
        $this->linkedOption = $linkedOption;
    }

    /**
     * @param int $maxHeight
     */
    public function setMaxHeight($maxHeight)
    {
        $this->maxHeight = $maxHeight;
    }

    /**
     * @param int $maxWidth
     */
    public function setMaxWidth($maxWidth)
    {
        $this->maxWidth = $maxWidth;
    }

    /**
     * @param int $minHeight
     */
    public function setMinHeight($minHeight)
    {
        $this->minHeight = $minHeight;
    }

    /**
     * @param int $minWidth
     */
    public function setMinWidth($minWidth)
    {
        $this->minWidth = $minWidth;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @param boolean $dynamicWindow
     */
    public function setDynamicWindow($dynamicWindow)
    {
        $this->dynamicWindow = $dynamicWindow;
    }

    /**
     * @param string $route
     */
    public function setRoute($route)
    {
        $this->route = $route;
    }
}
