<?php
namespace BusinessMan\Bundle\SchedulerBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * ScheduleDetailType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SchedulerBundle
 */
class ScheduleDetailType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('bookedFor', null, array('required' => false))
            ->add('startDate', 'date', array(
                'widget' => 'single_text',
                'format' => 'yyyy-MM-dd',
                'attr' => array('class' => 'date')
            ))
            ->add('startTime', 'time', array(
                'widget' => 'single_text'
            ))
            ->add('endDate', 'date', array(
                'widget' => 'single_text',
                'format' => 'yyyy-MM-dd',
                'attr' => array('class' => 'date')
            ))
            ->add('endTime', 'time', array(
                'widget' => 'single_text'
            ))
            ->add('allDay', 'checkbox', array('required' => false))
            ->add('scheduled', 'checkbox', array('required' => false))
            ->add('overrideConflicts', 'checkbox', array('mapped' => false, 'required' => false))
            ->add('save', 'submit');
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Scheduler\Bundle\CommonBundle\Entity\ScheduleDetail'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'businessman_schedulerbundle_scheduledetail';
    }
}
