<?php
namespace Scheduler\Bundle\CommonBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use JMS\Serializer\Annotation as Serializer;

/**
 * ScheduleEvent
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/scheduler/CommonBundle
 *
 * @ORM\Table(name="Scheduler_Events")
 * @ORM\Entity(repositoryClass="Scheduler\Bundle\CommonBundle\Repository\CommonRepository")
 */
class ScheduleEvent
{
    /**
     * @var int
     *
     * @ORM\Column(name="Event_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Event_Type", type="string")
     */
    protected $type;

    /**
     * @var int
     *
     * @ORM\Column(name="Colour_R_Text", type="integer")
     */
    protected $textRed;

    /**
     * @var int
     *
     * @ORM\Column(name="Colour_G_Text", type="integer")
     */
    protected $textGreen;

    /**
     * @var int
     *
     * @ORM\Column(name="Colour_B_Text", type="integer")
     */
    protected $textBlue;

    /**
     * @var int
     *
     * @ORM\Column(name="Colour_R_BG", type="integer")
     */
    protected $backgroundRed;

    /**
     * @var int
     *
     * @ORM\Column(name="Colour_G_BG", type="integer")
     */
    protected $backgroundGreen;

    /**
     * @var int
     *
     * @ORM\Column(name="Colour_B_BG", type="integer")
     */
    protected $backgroundBlue;

    /**
     * @var ResourceCategory
     *
     * @ORM\ManyToOne(targetEntity="ResourceCategory", inversedBy="events")
     * @ORM\JoinColumn(name="Resource_Category_ID", referencedColumnName="Resource_Category_ID")
     */
    protected $category;

    public function __construct()
    {
        $this->setBackgroundRgb('0,0,255');
        $this->setTextRgb('255,255,255');
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    public function getCategoryId()
    {
        return $this->categoryId;
    }

    public function getType()
    {
        return $this->type;
    }

    public function getTextRgb()
    {
        return implode(',', array($this->textRed, $this->textGreen, $this->textBlue));
    }

    public function getBackgroundRgb()
    {
        return implode(',', array($this->backgroundRed, $this->backgroundGreen, $this->backgroundBlue));
    }

    /**
     * @param mixed $category
     */
    public function setCategory($category)
    {
        $this->category = $category;
    }

    /**
     * @param mixed $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @param mixed $backgroundRgb
     */
    public function setBackgroundRgb($backgroundRgb)
    {
        $rgb = array_map('intval', explode(",", trim($backgroundRgb, "rgb()")));

        $this->setBackgroundRed($rgb[0]);
        $this->setBackgroundGreen($rgb[1]);
        $this->setBackgroundBlue($rgb[2]);
    }

    /**
     * @param mixed $textRgb
     */
    public function setTextRgb($textRgb)
    {
        $rgb = array_map('intval', explode(",", trim($textRgb, "rgb()")));

        $this->setTextRed($rgb[0]);
        $this->setTextGreen($rgb[1]);
        $this->setTextBlue($rgb[2]);
    }

    /**
     * @param mixed $backgroundBlue
     */
    public function setBackgroundBlue($backgroundBlue)
    {
        $this->backgroundBlue = $backgroundBlue;
    }

    /**
     * @return mixed
     */
    public function getBackgroundBlue()
    {
        return $this->backgroundBlue;
    }

    /**
     * @param mixed $backgroundGreen
     */
    public function setBackgroundGreen($backgroundGreen)
    {
        $this->backgroundGreen = $backgroundGreen;
    }

    /**
     * @return mixed
     */
    public function getBackgroundGreen()
    {
        return $this->backgroundGreen;
    }

    /**
     * @param mixed $backgroundRed
     */
    public function setBackgroundRed($backgroundRed)
    {
        $this->backgroundRed = $backgroundRed;
    }

    /**
     * @return mixed
     */
    public function getBackgroundRed()
    {
        return $this->backgroundRed;
    }

    /**
     * @param mixed $textBlue
     */
    public function setTextBlue($textBlue)
    {
        $this->textBlue = $textBlue;
    }

    /**
     * @return mixed
     */
    public function getTextBlue()
    {
        return $this->textBlue;
    }

    /**
     * @param mixed $textGreen
     */
    public function setTextGreen($textGreen)
    {
        $this->textGreen = $textGreen;
    }

    /**
     * @return mixed
     */
    public function getTextGreen()
    {
        return $this->textGreen;
    }

    /**
     * @param mixed $textRed
     */
    public function setTextRed($textRed)
    {
        $this->textRed = $textRed;
    }

    /**
     * @return mixed
     */
    public function getTextRed()
    {
        return $this->textRed;
    }

    public function getCategory()
    {
        return $this->category;
    }
}
