<?php
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Asset
 *
 * @ORM\Table(name="Scheduler_Event")
 * @ORM\Entity()
 *
 * @Serializer\XmlRoot("scheduleevent")
 * @Serializer\ExclusionPolicy("all")
 */
class ScheduleEvent
{
    /**
     * @ORM\Column(name="Event_ID", type="integer")
     * @ORM\Id
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @ORM\Column(name="Resource_Category_ID", type="string")
     */
    protected $categoryId;

    /**
     * @ORM\Column(name="Event_Type", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $type;

    /**
     * @ORM\Column(name="Colour_Text_RGBValue", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $textRgb;

    /**
     * @ORM\Column(name="Colour_BG_RGBValue", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $backgroundRgb;

    /**
     * @ORM\ManyToOne(targetEntity="ResourceCategory")
     * @ORM\JoinColumn(name="Resource_Category_ID", referencedColumnName="Resource_Category_ID")
     */
    protected $category;

    /**
     * Get id
     *
     * @return integer
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
        return $this->textRgb;
    }

    public function getBackgroundRgb()
    {
        return $this->backgroundRgb;
    }

    public function getCategory()
    {
        return $this->category;
    }
}
